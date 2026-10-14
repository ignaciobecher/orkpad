import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { ClientsService } from '../clients/clients.service';
import { MailService } from '../mail/mail.service';
import { TaskColumnsService } from '../task-columns/task-columns.service';
import { StorageService } from '../storage/storage.service';
import { TaskActivitiesService } from '../task-activities/task-activities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BoardsGateway } from './boards.gateway';
import { normalizeCalendarDate } from '../../common/utils/dates';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly projectsService: ProjectsService,
    private readonly clientsService: ClientsService,
    private readonly taskColumnsService: TaskColumnsService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly storageService: StorageService,
    private readonly activitiesService: TaskActivitiesService,
    @Optional() private readonly notificationsService?: NotificationsService,
    @Optional() private readonly boardsGateway?: BoardsGateway,
  ) {}

  findAll(workspaceId: string, query: QueryTaskDto) {
    const {
      page,
      limit,
      search,
      status,
      priority,
      projectId,
      assigneeId,
      columnId,
      memberId,
      archived,
    } = query as any;
    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (projectId) filters.projectId = projectId;
    if (assigneeId) filters.assigneeId = assigneeId;
    if (columnId !== undefined) filters.columnId = columnId;
    if (memberId) filters.memberIds = memberId;
    const includeArchived =
      archived === true || archived === 'true' || archived === '1';
    if (!includeArchived) filters.archived = { $ne: true };
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return this.tasksRepository.findAll(workspaceId, filters, {
      page,
      limit,
      sort: { order: 1, createdAt: -1 },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const task = await this.tasksRepository.findOne(workspaceId, id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async create(
    workspaceId: string,
    dto: CreateTaskDto,
    actor?: { userId?: string; name?: string },
  ) {
    const payload = await this.buildValidatedTaskPayload(workspaceId, dto);
    const task = await this.tasksRepository.create(workspaceId, payload);
    await this.activitiesService.log(workspaceId, {
      taskId: (task as any)._id.toString(),
      projectId: (task as any).projectId,
      actorId: actor?.userId,
      actorName: actor?.name,
      type: 'created',
      payload: { title: (task as any).title },
    });
    this.emit((task as any).projectId, 'task:created', { task });
    if ((dto as any).memberIds?.length || (dto as any).assigneeId) {
      await this.notifyAssignees(workspaceId, task as any, actor?.userId).catch(
        () => null,
      );
    }
    return task;
  }

  async update(
    workspaceId: string,
    id: string,
    dto: UpdateTaskDto,
    actor?: { userId?: string; name?: string },
  ) {
    const current = await this.findOne(workspaceId, id);
    const payload = await this.buildValidatedTaskPayload(
      workspaceId,
      dto,
      current,
    );
    const task = await this.tasksRepository.update(workspaceId, id, payload);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    const wasArchived = !!(current as any).archived;
    const nowArchived = !!(task as any).archived;
    await this.activitiesService.log(workspaceId, {
      taskId: id,
      projectId: (task as any).projectId,
      actorId: actor?.userId,
      actorName: actor?.name,
      type:
        !wasArchived && nowArchived
          ? 'archived'
          : wasArchived && !nowArchived
            ? 'unarchived'
            : 'updated',
      payload: {},
    });
    this.emit((task as any).projectId, 'task:updated', { task });
    return task;
  }

  async remove(
    workspaceId: string,
    id: string,
    actor?: { userId?: string; name?: string },
  ) {
    const task = await this.tasksRepository.softDelete(workspaceId, id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    await this.activitiesService.log(workspaceId, {
      taskId: id,
      projectId: (task as any).projectId,
      actorId: actor?.userId,
      actorName: actor?.name,
      type: 'updated',
      payload: { deleted: true },
    });
    this.emit((task as any).projectId, 'task:deleted', { taskId: id, task });
    return task;
  }

  async findDemo(workspaceId: string) {
    return this.tasksRepository.findAll(
      workspaceId,
      { isDemo: true },
      { limit: 100 },
    );
  }

  async move(
    workspaceId: string,
    id: string,
    dto: MoveTaskDto,
    actor?: { userId?: string; name?: string },
  ) {
    const column = await this.taskColumnsService
      .findOne(workspaceId, dto.columnId)
      .catch(() => null);
    if (!column) {
      throw new BadRequestException(
        'columnId must reference an existing task column in the workspace',
      );
    }

    const task = await this.tasksRepository.update(workspaceId, id, {
      columnId: dto.columnId,
      projectId: column.projectId,
      order: dto.order ?? 0,
    });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    await this.activitiesService.log(workspaceId, {
      taskId: id,
      projectId: (task as any).projectId,
      actorId: actor?.userId,
      actorName: actor?.name,
      type: 'moved',
      payload: { columnId: dto.columnId, order: dto.order ?? 0 },
    });
    this.emit((task as any).projectId, 'task:moved', { task });
    return task;
  }

  async duplicate(
    workspaceId: string,
    id: string,
    actor?: { userId?: string; name?: string },
  ) {
    const current = await this.findOne(workspaceId, id);
    const c = current as any;
    const copy = await this.tasksRepository.create(workspaceId, {
      title: `${c.title} (copia)`,
      description: c.description,
      projectId: c.projectId,
      columnId: c.columnId,
      order: (c.order ?? 0) + 1,
      priority: c.priority,
      status: 'todo',
      dueDate: c.dueDate,
      startDate: c.startDate,
      assigneeId: c.assigneeId,
      memberIds: c.memberIds ?? [],
      watcherIds: c.watcherIds ?? [],
      checklist: (c.checklist ?? []).map((i: any) => ({
        text: i.text,
        completed: false,
      })),
      labels: c.labels ?? [],
      attachments: [],
      coverColor: c.coverColor ?? null,
    });
    await this.activitiesService.log(workspaceId, {
      taskId: (copy as any)._id.toString(),
      projectId: (copy as any).projectId,
      actorId: actor?.userId,
      actorName: actor?.name,
      type: 'duplicated',
      payload: { sourceTaskId: id },
    });
    this.emit((copy as any).projectId, 'task:created', { task: copy });
    return copy;
  }

  async addAttachment(
    workspaceId: string,
    id: string,
    file: { buffer: Buffer; originalName: string; mimeType: string },
    actor?: { userId?: string; name?: string },
  ) {
    const task = await this.findOne(workspaceId, id);
    const stored = await this.storageService.save(workspaceId, file);
    const entry = {
      id: stored.id,
      name: stored.originalName,
      url: stored.url,
      type: stored.mimeType,
      size: stored.size,
      uploadedAt: new Date(),
    };
    const next = [...(((task as any).attachments ?? []) as any[]), entry];
    const updated = await this.tasksRepository.update(workspaceId, id, {
      attachments: next,
    });
    await this.activitiesService.log(workspaceId, {
      taskId: id,
      projectId: (task as any).projectId,
      actorId: actor?.userId,
      actorName: actor?.name,
      type: 'attachment_added',
      payload: { fileId: stored.id, name: stored.originalName },
    });
    this.emit((task as any).projectId, 'task:updated', { task: updated });
    return { task: updated, file: entry };
  }

  async removeAttachment(
    workspaceId: string,
    id: string,
    fileId: string,
    actor?: { userId?: string; name?: string },
  ) {
    const task = await this.findOne(workspaceId, id);
    const current = ((task as any).attachments ?? []) as any[];
    const found = current.find((a) => a.id === fileId);
    if (!found) throw new NotFoundException(`Attachment ${fileId} not found`);
    await this.storageService.remove(workspaceId, fileId).catch(() => null);
    const next = current.filter((a) => a.id !== fileId);
    const patch: Record<string, any> = { attachments: next };
    if ((task as any).coverAttachmentId === fileId)
      patch.coverAttachmentId = null;
    const updated = await this.tasksRepository.update(workspaceId, id, patch);
    await this.activitiesService.log(workspaceId, {
      taskId: id,
      projectId: (task as any).projectId,
      actorId: actor?.userId,
      actorName: actor?.name,
      type: 'attachment_removed',
      payload: { fileId, name: found.name },
    });
    this.emit((task as any).projectId, 'task:updated', { task: updated });
    return updated;
  }

  async complete(
    workspaceId: string,
    id: string,
    dto: CompleteTaskDto,
    actor?: { userId?: string; name?: string },
  ) {
    const task = await this.findOne(workspaceId, id);
    const markAsDone = dto.completed !== false;

    if (markAsDone && task.status !== 'done') {
      await this.tasksRepository.update(workspaceId, id, {
        status: 'done',
      });
    } else if (!markAsDone && task.status === 'done') {
      await this.tasksRepository.update(workspaceId, id, {
        status: 'todo',
      });
    }

    const updatedTask = await this.findOne(workspaceId, id);

    await this.activitiesService.log(workspaceId, {
      taskId: id,
      projectId: (updatedTask as any).projectId,
      actorId: actor?.userId,
      actorName: actor?.name,
      type: markAsDone ? 'completed' : 'reopened',
      payload: {},
    });
    this.emit((updatedTask as any).projectId, 'task:updated', {
      task: updatedTask,
    });

    const project = task.projectId
      ? await this.projectsService
          .findOne(workspaceId, task.projectId)
          .catch(() => null)
      : null;

    const client =
      project && (project as any).clientId
        ? await this.clientsService
            .findOne(workspaceId, (project as any).clientId)
            .catch(() => null)
        : null;

    const assignee = task.assigneeId
      ? await this.usersService.findWorkspaceMemberById(
          workspaceId,
          task.assigneeId,
        )
      : null;

    const completedAt = new Date();
    const whatsappText = this.buildWhatsAppMessage({
      clientName: client ? (client as any).name : 'Cliente',
      projectName: project ? (project as any).name : '',
      taskTitle: task.title,
      taskDescription: (updatedTask as any).description,
      checklist: (updatedTask as any).checklist,
      completedAt,
      assigneeName: assignee ? (assignee as any).name : null,
    });

    const rawPhone = client
      ? ((client as any).phone as string | undefined)
      : undefined;
    const phone = rawPhone ? rawPhone.replace(/\D/g, '') : null;
    const whatsappUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappText)}`
      : null;

    let emailSent = false;
    if (dto.sendEmail && client && (client as any).email) {
      await this.mailService.sendTaskCompletionEmail((client as any).email, {
        clientName: (client as any).name,
        projectName: project ? (project as any).name : '',
        taskTitle: updatedTask.title,
        taskDescription: (updatedTask as any).description,
        checklist: (updatedTask as any).checklist,
        dueDate: (updatedTask as any).dueDate
          ? new Date((updatedTask as any).dueDate)
          : undefined,
        assigneeName: assignee ? (assignee as any).name : undefined,
        completedAt,
      });
      emailSent = true;
    }

    return {
      task: updatedTask,
      project: project
        ? { _id: (project as any)._id, name: (project as any).name }
        : null,
      client: client
        ? {
            name: (client as any).name,
            email: (client as any).email ?? null,
            phone: rawPhone ?? null,
          }
        : null,
      whatsappText,
      whatsappUrl,
      emailSent,
    };
  }

  private emit(projectId: string | undefined, event: string, payload: any) {
    try {
      if (projectId) this.boardsGateway?.emitToProject(projectId, event, payload);
    } catch {
      /* realtime es best-effort */
    }
  }

  private async notifyAssignees(
    workspaceId: string,
    task: any,
    authorId?: string,
  ) {
    if (!this.notificationsService) return;
    const targets = new Set<string>([
      ...((task.memberIds ?? []) as string[]),
      ...((task.watcherIds ?? []) as string[]),
      ...(task.assigneeId ? [task.assigneeId] : []),
    ]);
    for (const userId of targets) {
      if (authorId && userId === authorId) continue;
      await this.notificationsService
        .create(workspaceId, {
          userId,
          title: `Te asignaron "${task.title}"`,
          message: task.description?.replace(/<[^>]*>/g, '').slice(0, 200) ?? '',
          type: 'info',
          link: `/app/tasks?task=${task._id?.toString()}`,
        } as any)
        .catch(() => null);
    }
  }

  private buildWhatsAppMessage(data: {
    clientName: string;
    projectName: string;
    taskTitle: string;
    taskDescription?: string;
    checklist?: { text: string; completed: boolean }[];
    completedAt: Date;
    assigneeName?: string | null;
  }): string {
    const {
      clientName,
      projectName,
      taskTitle,
      taskDescription,
      checklist,
      completedAt,
      assigneeName,
    } = data;
    const date = completedAt.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    let plain = '';
    if (taskDescription) {
      plain = taskDescription
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li>/gi, '• ')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .trim();
    }

    let msg = `Hola ${clientName}!\n\n`;
    msg += projectName
      ? `Te informo que finalizamos la siguiente tarea del proyecto ${projectName}:\n\n`
      : `Te informo que finalizamos la siguiente tarea:\n\n`;
    msg += `[X] ${taskTitle}`;
    if (plain) msg += `\n${plain}`;

    if (checklist && checklist.length > 0) {
      const completedCount = checklist.filter((item) => item.completed).length;
      const totalCount = checklist.length;
      msg += `\n\nProgreso: ${completedCount}/${totalCount} (${Math.round((completedCount / totalCount) * 100)}%)`;
      checklist.forEach((item) => {
        const check = item.completed ? '[X]' : '[ ]';
        msg += `\n${check} ${item.text}`;
      });
    }

    msg += `\n\nCompletado: ${date}`;
    if (assigneeName) msg += `\nRealizado por: ${assigneeName}`;
    msg += `\n\nQuedamos a disposicion para cualquier consulta. Saludos!`;

    return msg;
  }

  private async buildValidatedTaskPayload(
    workspaceId: string,
    dto: CreateTaskDto | UpdateTaskDto,
    current?: Awaited<ReturnType<TasksService['findOne']>>,
  ) {
    const payload: Record<string, any> = { ...dto };
    const requestedProjectId = dto.projectId ?? current?.projectId;
    const requestedAssigneeId = dto.assigneeId ?? current?.assigneeId;
    const requestedColumnId = dto.columnId ?? current?.columnId;

    if (dto.checklist) {
      payload.checklist = dto.checklist.map((item) => ({
        text: item.text,
        completed: item.completed ?? false,
      }));
    }

    if (requestedProjectId) {
      const project = await this.projectsService
        .findOne(workspaceId, requestedProjectId)
        .catch(() => null);
      if (!project) {
        throw new BadRequestException(
          'projectId must reference an existing project in the workspace',
        );
      }
    }

    if (requestedAssigneeId) {
      const user = await this.usersService.findWorkspaceMemberById(
        workspaceId,
        requestedAssigneeId,
      );
      if (!user) {
        throw new BadRequestException(
          'assigneeId must reference an existing user in the workspace',
        );
      }
    }

    const memberIds =
      (dto as any).memberIds ?? (current as any)?.memberIds ?? undefined;
    if (memberIds !== undefined) {
      for (const mid of memberIds) {
        const u = await this.usersService
          .findWorkspaceMemberById(workspaceId, mid)
          .catch(() => null);
        if (!u)
          throw new BadRequestException(
            `memberIds contains unknown user ${mid}`,
          );
      }
      payload.memberIds = memberIds;
    }

    const watcherIds =
      (dto as any).watcherIds ?? (current as any)?.watcherIds ?? undefined;
    if (watcherIds !== undefined) {
      for (const wid of watcherIds) {
        const u = await this.usersService
          .findWorkspaceMemberById(workspaceId, wid)
          .catch(() => null);
        if (!u)
          throw new BadRequestException(
            `watcherIds contains unknown user ${wid}`,
          );
      }
      payload.watcherIds = watcherIds;
    }

    if (requestedColumnId) {
      const column = await this.taskColumnsService
        .findOne(workspaceId, requestedColumnId)
        .catch(() => null);
      if (!column) {
        throw new BadRequestException(
          'columnId must reference an existing task column in the workspace',
        );
      }

      if (requestedProjectId && column.projectId !== requestedProjectId) {
        throw new BadRequestException(
          'columnId must belong to the selected projectId',
        );
      }

      payload.projectId = column.projectId;
    }

    if ((dto as any).dueDate !== undefined) {
      const normalized = normalizeCalendarDate((dto as any).dueDate);
      if (normalized) payload.dueDate = normalized;
    }

    if ((dto as any).startDate !== undefined) {
      const v = (dto as any).startDate;
      if (v === null || v === '') payload.startDate = null;
      else {
        const normalized = normalizeCalendarDate(v);
        if (normalized) payload.startDate = normalized;
      }
    }

    return payload;
  }
}
