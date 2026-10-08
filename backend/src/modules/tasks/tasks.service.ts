import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { ClientsService } from '../clients/clients.service';
import { MailService } from '../mail/mail.service';
import { AiIndexService } from '../ai/ai-index.service';
import { TaskColumnsService } from '../task-columns/task-columns.service';
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
    private readonly aiIndex: AiIndexService,
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
    } = query;
    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (projectId) filters.projectId = projectId;
    if (assigneeId) filters.assigneeId = assigneeId;
    if (columnId !== undefined) filters.columnId = columnId;
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

  async create(workspaceId: string, dto: CreateTaskDto) {
    const payload = await this.buildValidatedTaskPayload(workspaceId, dto);
    const task = await this.tasksRepository.create(workspaceId, payload);
    this.aiIndex.notifyChanged(workspaceId, 'task', (task._id as any).toString());
    return task;
  }

  async update(workspaceId: string, id: string, dto: UpdateTaskDto) {
    const current = await this.findOne(workspaceId, id);
    const payload = await this.buildValidatedTaskPayload(
      workspaceId,
      dto,
      current,
    );
    const task = await this.tasksRepository.update(workspaceId, id, payload);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    this.aiIndex.notifyChanged(workspaceId, 'task', id);
    return task;
  }

  async remove(workspaceId: string, id: string) {
    const task = await this.tasksRepository.softDelete(workspaceId, id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    this.aiIndex.notifyChanged(workspaceId, 'task', id, true);
    return task;
  }

  async findDemo(workspaceId: string) {
    return this.tasksRepository.findAll(
      workspaceId,
      { isDemo: true },
      { limit: 100 },
    );
  }

  async move(workspaceId: string, id: string, dto: MoveTaskDto) {
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
    this.aiIndex.notifyChanged(workspaceId, 'task', id);
    return task;
  }

  async complete(workspaceId: string, id: string, dto: CompleteTaskDto) {
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

    this.aiIndex.notifyChanged(workspaceId, 'task', id);
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

    return payload;
  }
}
