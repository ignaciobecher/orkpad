import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskCommentsRepository } from './task-comments.repository';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';
import { TasksService } from '../tasks/tasks.service';
import { TaskActivitiesService } from '../task-activities/task-activities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { Task, TaskDocument } from '../tasks/tasks.schema';
import { BoardsGateway } from '../tasks/boards.gateway';

function extractMentions(text: string): string[] {
  // Soporta @nombre y @userId — el frontend envía mentions explícitos,
  // esto es fallback por si viene en el texto como @<24hex>.
  const out = new Set<string>();
  const re = /@([a-f0-9]{24})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.add(m[1]);
  return [...out];
}

@Injectable()
export class TaskCommentsService {
  constructor(
    private readonly commentsRepository: TaskCommentsRepository,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
    private readonly activitiesService: TaskActivitiesService,
    private readonly usersService: UsersService,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @Optional() private readonly notificationsService?: NotificationsService,
    @Optional() private readonly boardsGateway?: BoardsGateway,
  ) {}

  async findByTask(
    workspaceId: string,
    taskId: string,
    page = 1,
    limit = 50,
  ) {
    await this.tasksService.findOne(workspaceId, taskId);
    return this.commentsRepository.findByTask(workspaceId, taskId, page, limit);
  }

  async create(
    workspaceId: string,
    taskId: string,
    authorId: string,
    dto: CreateTaskCommentDto,
  ) {
    const task = await this.tasksService.findOne(workspaceId, taskId);
    const author = await this.usersService
      .findWorkspaceMemberById(workspaceId, authorId)
      .catch(() => null);

    const autoMentions = extractMentions(dto.text);
    const mentions = [...new Set([...(dto.mentions ?? []), ...autoMentions])];

    const comment = await this.commentsRepository.create(workspaceId, {
      taskId,
      projectId: (task as any).projectId,
      authorId,
      authorName: (author as any)?.name ?? 'Miembro',
      text: dto.text,
      mentions,
    });

    const count = await this.commentsRepository.countByTask(
      workspaceId,
      taskId,
    );
    await this.taskModel
      .updateOne(
        { _id: taskId, workspaceId },
        { $set: { commentsCount: count } },
      )
      .exec()
      .catch(() => null);

    await this.activitiesService.log(workspaceId, {
      taskId,
      projectId: (task as any).projectId,
      actorId: authorId,
      actorName: (author as any)?.name,
      type: 'commented',
      payload: { commentId: (comment as any)._id?.toString() },
    });

    // Notificar a mencionados (sin romper si falla)
    if (this.notificationsService && mentions.length) {
      for (const userId of mentions) {
        if (userId === authorId) continue;
        const mentioned = await this.usersService
          .findWorkspaceMemberById(workspaceId, userId)
          .catch(() => null);
        if (!mentioned) continue;
        await this.notificationsService
          .create(workspaceId, {
            userId,
            title: `Te mencionaron en "${(task as any).title}"`,
            message: dto.text.slice(0, 200),
            type: 'info',
            link: `/app/tasks?task=${taskId}`,
          } as any)
          .catch(() => null);
      }
    }

    // Notificar a watchers + miembros (excepto autor y mencionados)
    if (this.notificationsService) {
      const watchTargets = new Set<string>([
        ...(((task as any).memberIds ?? []) as string[]),
        ...(((task as any).watcherIds ?? []) as string[]),
        ...(((task as any).assigneeId ? [(task as any).assigneeId] : []) as string[]),
      ]);
      for (const userId of watchTargets) {
        if (userId === authorId || mentions.includes(userId)) continue;
        await this.notificationsService
          .create(workspaceId, {
            userId,
            title: `Nuevo comentario en "${(task as any).title}"`,
            message: dto.text.slice(0, 200),
            type: 'info',
            link: `/app/tasks?task=${taskId}`,
          } as any)
          .catch(() => null);
      }
    }

    try {
      this.boardsGateway?.emitToProject((task as any).projectId, 'comment:created', {
        taskId,
        comment,
      });
    } catch {
      /* best-effort */
    }

    return comment;
  }

  async update(
    workspaceId: string,
    taskId: string,
    commentId: string,
    authorId: string,
    dto: UpdateTaskCommentDto,
  ) {
    const existing = await this.commentsRepository.findOne(
      workspaceId,
      commentId,
    );
    if (!existing || (existing as any).taskId !== taskId)
      throw new NotFoundException(`Comment ${commentId} not found`);
    if ((existing as any).authorId !== authorId)
      throw new ForbiddenException('Solo el autor puede editar el comentario');
    const updated = await this.commentsRepository.update(
      workspaceId,
      commentId,
      { text: dto.text, editedAt: new Date() },
    );
    return updated;
  }

  async remove(workspaceId: string, taskId: string, commentId: string) {
    const existing = await this.commentsRepository.findOne(
      workspaceId,
      commentId,
    );
    if (!existing || (existing as any).taskId !== taskId)
      throw new NotFoundException(`Comment ${commentId} not found`);
    await this.commentsRepository.softDelete(workspaceId, commentId);
    const task = await this.tasksService.findOne(workspaceId, taskId).catch(() => null);
    const count = await this.commentsRepository.countByTask(
      workspaceId,
      taskId,
    );
    if (task) {
      await this.taskModel
        .updateOne({ _id: taskId, workspaceId }, { $set: { commentsCount: count } })
        .exec()
        .catch(() => null);
    }
    return { success: true };
  }
}
