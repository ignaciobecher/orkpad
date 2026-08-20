import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';
import { WorkSessionsService } from '../work-sessions/work-sessions.service';
import { TimeTrackingRepository } from './time-tracking.repository';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { QueryTimeEntryDto } from './dto/query-time-entry.dto';

@Injectable()
export class TimeTrackingService {
  constructor(
    private readonly timeTrackingRepository: TimeTrackingRepository,
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
    private readonly workSessionsService: WorkSessionsService,
  ) {}

  findAll(workspaceId: string, query: QueryTimeEntryDto) {
    const { page, limit, projectId, taskId, userId, billable, sessionId } =
      query;
    const filters: Record<string, any> = {};
    if (projectId) filters.projectId = projectId;
    if (taskId) filters.taskId = taskId;
    if (userId) filters.userId = userId;
    if (billable !== undefined) filters.billable = billable;
    if (sessionId) filters.sessionId = sessionId;
    return this.timeTrackingRepository.findAll(workspaceId, filters, {
      page,
      limit,
    });
  }

  async findOne(workspaceId: string, id: string) {
    const entry = await this.timeTrackingRepository.findOne(workspaceId, id);
    if (!entry) throw new NotFoundException(`Time entry ${id} not found`);
    return entry;
  }

  async create(workspaceId: string, userId: string, dto: CreateTimeEntryDto) {
    if (dto.endTime && new Date(dto.endTime) <= new Date(dto.startTime)) {
      throw new BadRequestException('endTime must be after startTime');
    }
    await this.validateRelations(
      workspaceId,
      userId,
      dto.projectId,
      dto.taskId,
      dto.sessionId,
      {
        requireActiveSession: true,
      },
    );

    if (dto.sessionId) {
      await this.closeOpenEntry(workspaceId, dto.sessionId, dto.startTime);
    }

    const duration = this.computeDuration(dto.startTime, dto.endTime);
    return this.timeTrackingRepository.create(workspaceId, {
      ...dto,
      userId,
      duration,
    });
  }

  private async closeOpenEntry(
    workspaceId: string,
    sessionId: string,
    newStartTime: string,
  ) {
    const open = await this.timeTrackingRepository.findOpenBySession(
      workspaceId,
      sessionId,
    );
    if (!open || new Date(newStartTime) <= new Date(open.startTime)) return;

    const duration = this.computeDuration(open.startTime, newStartTime);
    await this.timeTrackingRepository.update(workspaceId, String(open._id), {
      endTime: newStartTime,
      duration,
    });
  }

  async update(workspaceId: string, id: string, dto: UpdateTimeEntryDto) {
    const entry = await this.findOne(workspaceId, id);
    const startTime = dto.startTime ? new Date(dto.startTime) : entry.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : entry.endTime;
    if (endTime && endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }
    const sessionId =
      dto.sessionId !== undefined ? dto.sessionId : entry.sessionId;
    await this.validateRelations(
      workspaceId,
      entry.userId,
      dto.projectId ?? entry.projectId,
      dto.taskId ?? entry.taskId,
      sessionId ?? undefined,
      { requireActiveSession: false },
    );
    const duration = this.computeDuration(startTime, endTime ?? undefined);
    const updated = await this.timeTrackingRepository.update(workspaceId, id, {
      ...dto,
      duration,
    });
    if (!updated) throw new NotFoundException(`Time entry ${id} not found`);
    return updated;
  }

  async remove(workspaceId: string, id: string) {
    const entry = await this.timeTrackingRepository.softDelete(workspaceId, id);
    if (!entry) throw new NotFoundException(`Time entry ${id} not found`);
    return entry;
  }

  private computeDuration(
    startTime: Date | string,
    endTime?: Date | string,
  ): number {
    if (!endTime) return 0;
    return Math.round(
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000,
    );
  }

  private async validateRelations(
    workspaceId: string,
    userId: string,
    projectId?: string,
    taskId?: string,
    sessionId?: string,
    options: { requireActiveSession: boolean } = {
      requireActiveSession: false,
    },
  ) {
    const [user, project, task, session] = await Promise.all([
      this.usersService.findWorkspaceMemberById(workspaceId, userId),
      projectId
        ? this.projectsService.findOne(workspaceId, projectId).catch(() => null)
        : null,
      taskId
        ? this.tasksService.findOne(workspaceId, taskId).catch(() => null)
        : null,
      sessionId
        ? this.workSessionsService
            .findOne(workspaceId, sessionId)
            .catch(() => null)
        : null,
    ]);

    if (!user) {
      throw new BadRequestException(
        'userId must reference an existing user in the workspace',
      );
    }

    if (projectId && !project) {
      throw new BadRequestException(
        'projectId must reference an existing project in the workspace',
      );
    }

    if (taskId) {
      if (!task) {
        throw new BadRequestException(
          'taskId must reference an existing task in the workspace',
        );
      }
      if (projectId && task.projectId && task.projectId !== projectId) {
        throw new BadRequestException(
          'taskId must belong to the selected projectId',
        );
      }
    }

    if (sessionId) {
      if (!session) {
        throw new BadRequestException(
          'sessionId must reference an existing work session in the workspace',
        );
      }
      if (options.requireActiveSession && session.endTime) {
        throw new BadRequestException(
          'sessionId must reference an active work session',
        );
      }
    }
  }
}
