import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ADMIN_USER_ID, ADMIN_EMAIL } from '../../common/guards/admin.guard';
import { SupportConversationsRepository } from './support-conversations.repository';
import { SupportMessagesRepository } from './support-messages.repository';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { QuerySupportMessagesDto } from './dto/query-support-messages.dto';
import { QuerySupportConversationsDto } from './dto/query-support-conversations.dto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SupportService {
  private adminWorkspaceId: string | null = null;

  constructor(
    private readonly conversationsRepository: SupportConversationsRepository,
    private readonly messagesRepository: SupportMessagesRepository,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ─── Cliente (tenant-scoped) ────────────────────────────────────────────────

  async getOrCreateMyConversation(workspaceId: string, userId: string) {
    if (userId === ADMIN_USER_ID) {
      throw new ForbiddenException(
        'El admin no tiene una conversación de soporte consigo mismo',
      );
    }

    const user = await this.usersService.findById(userId);
    return this.conversationsRepository.findOrCreateForUser(
      workspaceId,
      userId,
      user?.name ?? null,
      user?.email ?? null,
    );
  }

  async getMyMessages(
    workspaceId: string,
    userId: string,
    query: QuerySupportMessagesDto,
  ) {
    const conversation = await this.getOrCreateMyConversation(
      workspaceId,
      userId,
    );
    const conversationId = (conversation._id as any).toString();

    const result = await this.messagesRepository.findByConversation(
      workspaceId,
      conversationId,
      query.page ?? 1,
      query.limit ?? 30,
    );

    // El cliente está viendo el hilo — marca como leídos los mensajes del admin
    await Promise.all([
      this.messagesRepository.markConversationRead(
        workspaceId,
        conversationId,
        'admin',
      ),
      this.conversationsRepository.resetUnreadCustomer(
        workspaceId,
        conversationId,
      ),
    ]);

    return result;
  }

  async sendCustomerMessage(
    workspaceId: string,
    userId: string,
    dto: CreateSupportMessageDto,
  ) {
    const conversation = await this.getOrCreateMyConversation(
      workspaceId,
      userId,
    );
    const conversationId = (conversation._id as any).toString();

    const message = await this.messagesRepository.create(workspaceId, {
      conversationId,
      senderType: 'customer',
      senderId: userId,
      content: dto.content,
      isRead: false,
      readAt: null,
    });

    await Promise.all([
      this.conversationsRepository.incrementUnreadAdmin(
        workspaceId,
        conversationId,
      ),
      this.conversationsRepository.touchLastMessage(
        workspaceId,
        conversationId,
        dto.content,
      ),
    ]);

    this.notifyAdmin(conversation, conversationId, dto.content).catch(() => {});

    return { message, conversation };
  }

  // ─── Admin (cross-tenant) ───────────────────────────────────────────────────

  findAllConversationsForAdmin(query: QuerySupportConversationsDto) {
    return this.conversationsRepository.findAllForAdmin(
      { search: query.search },
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async findConversationForAdmin(conversationId: string) {
    const conversation =
      await this.conversationsRepository.findByIdForAdmin(conversationId);
    if (!conversation)
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    return conversation;
  }

  async findMessagesForAdmin(
    conversationId: string,
    query: QuerySupportMessagesDto,
  ) {
    await this.findConversationForAdmin(conversationId);
    return this.messagesRepository.findByConversationForAdmin(
      conversationId,
      query.page ?? 1,
      query.limit ?? 30,
    );
  }

  async sendAdminMessage(
    conversationId: string,
    adminUserId: string,
    dto: CreateSupportMessageDto,
  ) {
    const conversation = await this.findConversationForAdmin(conversationId);
    const workspaceId = conversation.workspaceId;

    const message = await this.messagesRepository.create(workspaceId, {
      conversationId,
      senderType: 'admin',
      senderId: adminUserId,
      content: dto.content,
      isRead: true,
      readAt: new Date(),
    });

    await Promise.all([
      this.conversationsRepository.touchLastMessage(
        workspaceId,
        conversationId,
        dto.content,
      ),
      this.conversationsRepository.incrementUnreadCustomer(
        workspaceId,
        conversationId,
      ),
    ]);

    return message;
  }

  async markConversationReadForAdmin(conversationId: string) {
    const conversation = await this.findConversationForAdmin(conversationId);
    await Promise.all([
      this.messagesRepository.markConversationReadForAdmin(conversationId),
      this.conversationsRepository.resetUnreadAdmin(
        conversation.workspaceId,
        conversationId,
      ),
    ]);
    return { success: true };
  }

  getAdminUnreadTotal() {
    return this.conversationsRepository.getTotalUnreadForAdmin();
  }

  // ─── Internos ───────────────────────────────────────────────────────────────

  private async getAdminWorkspaceId(): Promise<string | null> {
    if (this.adminWorkspaceId) return this.adminWorkspaceId;
    const admin = await this.usersService.findById(ADMIN_USER_ID);
    this.adminWorkspaceId = admin?.workspaceId ?? null;
    return this.adminWorkspaceId;
  }

  private async notifyAdmin(
    conversation: { userName?: string | null; userEmail?: string | null },
    conversationId: string,
    content: string,
  ) {
    const preview =
      content.length > 60 ? content.substring(0, 60) + '...' : content;
    const customerName = conversation.userName ?? 'Un usuario';
    const customerEmail = conversation.userEmail ?? '';

    await this.mailService.sendSupportMessageNotification(ADMIN_EMAIL, {
      customerName,
      customerEmail,
      messagePreview: preview,
      conversationId,
    });

    const adminWorkspaceId = await this.getAdminWorkspaceId();
    if (!adminWorkspaceId) return;

    await this.notificationsService.create(adminWorkspaceId, {
      userId: ADMIN_USER_ID,
      title: `Nuevo mensaje de soporte — ${customerName}`,
      message: preview,
      type: 'info',
      link: '/app/admin-users',
      refId: conversationId,
      refType: 'support-conversation',
    });
  }
}
