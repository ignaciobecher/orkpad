import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationsRepository } from './conversations.repository';
import { MessagesRepository } from './messages.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { QueryConversationsDto } from './dto/query-conversations.dto';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { User, UserDocument } from '../users/users.schema';

@Injectable()
export class MessagingService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly messagesRepository: MessagesRepository,
    private readonly notificationsService: NotificationsService,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // ─── Admin Methods ─────────────────────────────────────────────────────────

  findAllConversations(workspaceId: string, query: QueryConversationsDto) {
    const filters: Record<string, any> = {};
    if (query.clientId) filters.clientId = query.clientId;
    return this.conversationsRepository.findAll(workspaceId, filters, {
      page: query.page,
      limit: query.limit,
      sort: { lastMessageAt: -1 },
    });
  }

  async findConversation(workspaceId: string, id: string) {
    const conversation = await this.conversationsRepository.findOne(
      workspaceId,
      id,
    );
    if (!conversation)
      throw new NotFoundException(`Conversation ${id} not found`);
    return conversation;
  }

  async createConversation(workspaceId: string, dto: CreateConversationDto) {
    if (dto.projectId) {
      const existing = await this.conversationsRepository.findByProjectId(
        workspaceId,
        dto.projectId,
      );
      if (existing) return existing;
    }
    return this.conversationsRepository.create(workspaceId, dto);
  }

  async findMessages(
    workspaceId: string,
    conversationId: string,
    query: QueryMessagesDto,
  ) {
    const conversation = await this.conversationsRepository.findOne(
      workspaceId,
      conversationId,
    );
    if (!conversation)
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    return this.messagesRepository.findByConversation(
      workspaceId,
      conversationId,
      query.page ?? 1,
      query.limit ?? 30,
    );
  }

  async sendAdminMessage(
    workspaceId: string,
    conversationId: string,
    senderId: string,
    dto: CreateMessageDto,
  ) {
    const conversation = await this.conversationsRepository.findOne(
      workspaceId,
      conversationId,
    );
    if (!conversation)
      throw new NotFoundException(`Conversation ${conversationId} not found`);

    const message = await this.messagesRepository.create(workspaceId, {
      conversationId,
      senderType: 'admin',
      senderId,
      content: dto.content,
      isRead: true,
      readAt: new Date(),
    });

    await this.conversationsRepository.touchLastMessage(
      workspaceId,
      conversationId,
    );

    return message;
  }

  async markConversationRead(workspaceId: string, conversationId: string) {
    const conversation = await this.conversationsRepository.findOne(
      workspaceId,
      conversationId,
    );
    if (!conversation)
      throw new NotFoundException(`Conversation ${conversationId} not found`);

    await Promise.all([
      this.messagesRepository.markConversationRead(workspaceId, conversationId),
      this.conversationsRepository.resetUnread(workspaceId, conversationId),
    ]);

    return { success: true };
  }

  // ─── Public (Client) Methods ───────────────────────────────────────────────

  async resolveProjectByToken(publicToken: string): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findOne({ publicToken, isDeleted: false })
      .lean()
      .exec();
    if (!project) throw new NotFoundException('Link inválido o revocado');
    return project;
  }

  async getOrCreateConversationForProject(publicToken: string) {
    const project = await this.resolveProjectByToken(publicToken);
    const projectId = (project._id as any).toString();
    const workspaceId = project.workspaceId;

    let conversation = await this.conversationsRepository.findByProjectId(
      workspaceId,
      projectId,
    );

    if (!conversation) {
      if (!project.clientId) {
        throw new BadRequestException(
          'Este proyecto no tiene un cliente asociado y no puede iniciar una conversación',
        );
      }
      conversation = await this.conversationsRepository.create(workspaceId, {
        clientId: project.clientId,
        projectId,
      });
    }

    return { conversation, workspaceId, project };
  }

  async findPublicMessages(publicToken: string, query: QueryMessagesDto) {
    const { conversation, workspaceId } =
      await this.getOrCreateConversationForProject(publicToken);
    const conversationId = (conversation._id as any).toString();
    return this.messagesRepository.findByConversation(
      workspaceId,
      conversationId,
      query.page ?? 1,
      query.limit ?? 30,
    );
  }

  async sendClientMessage(publicToken: string, dto: CreateMessageDto) {
    const { conversation, workspaceId, project } =
      await this.getOrCreateConversationForProject(publicToken);
    const conversationId = (conversation._id as any).toString();

    const message = await this.messagesRepository.create(workspaceId, {
      conversationId,
      senderType: 'client',
      senderId: null,
      content: dto.content,
      isRead: false,
      readAt: null,
    });

    await this.conversationsRepository.incrementUnread(
      workspaceId,
      conversationId,
    );

    // Notificar a todos los usuarios del workspace (admins)
    this.notifyWorkspaceAdmins(workspaceId, project, dto.content).catch(
      () => {},
    );

    return { message, conversationId, workspaceId };
  }

  // ─── Internos ─────────────────────────────────────────────────────────────

  private async notifyWorkspaceAdmins(
    workspaceId: string,
    project: ProjectDocument,
    messagePreview: string,
  ) {
    const users = await this.userModel
      .find({ workspaceId })
      .select('_id')
      .lean()
      .exec();
    const preview =
      messagePreview.length > 60
        ? messagePreview.substring(0, 60) + '...'
        : messagePreview;

    await Promise.all(
      users.map((u) =>
        this.notificationsService.create(workspaceId, {
          userId: (u._id as any).toString(),
          title: `Nuevo mensaje — ${(project as any).name ?? 'Proyecto'}`,
          message: preview,
          type: 'info',
          link: '/app/messaging',
          refId: workspaceId,
          refType: 'conversation',
        }),
      ),
    );
  }
}
