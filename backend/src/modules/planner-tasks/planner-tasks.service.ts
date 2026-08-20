import { Injectable, NotFoundException } from '@nestjs/common';
import { PlannerTasksRepository } from './planner-tasks.repository';
import { CreatePlannerTaskDto } from './dto/create-planner-task.dto';
import { UpdatePlannerTaskDto } from './dto/update-planner-task.dto';
import { QueryPlannerTaskDto } from './dto/query-planner-task.dto';
import { ReorderPlannerTasksDto } from './dto/reorder-planner-tasks.dto';

@Injectable()
export class PlannerTasksService {
  constructor(
    private readonly plannerTasksRepository: PlannerTasksRepository,
  ) {}

  async findAll(
    workspaceId: string,
    userId: string,
    query: QueryPlannerTaskDto,
  ) {
    const { blockId, status, page, limit } = query;

    if (blockId) {
      const tasks = await this.plannerTasksRepository.findByBlockId(
        workspaceId,
        blockId,
      );
      return { data: tasks, total: tasks.length, page: 1, limit: tasks.length };
    }

    const filters: Record<string, any> = { userId };
    if (status) filters.status = status;

    return this.plannerTasksRepository.findAll(workspaceId, filters, {
      page,
      limit,
      sort: { order: 1 },
    });
  }

  async findOne(workspaceId: string, userId: string, id: string) {
    const task = await this.plannerTasksRepository.findOneBy(workspaceId, {
      _id: id,
      userId,
    });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  create(workspaceId: string, userId: string, dto: CreatePlannerTaskDto) {
    return this.plannerTasksRepository.create(workspaceId, { ...dto, userId });
  }

  async update(
    workspaceId: string,
    userId: string,
    id: string,
    dto: UpdatePlannerTaskDto,
  ) {
    await this.findOne(workspaceId, userId, id);
    const task = await this.plannerTasksRepository.update(workspaceId, id, dto);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async toggle(workspaceId: string, userId: string, id: string) {
    const task = await this.findOne(workspaceId, userId, id);
    const nowCompleted = !(task as any).completed;
    const updated = await this.plannerTasksRepository.update(workspaceId, id, {
      completed: nowCompleted,
      status: nowCompleted ? 'completed' : 'pending',
      completedAt: nowCompleted ? new Date() : null,
    });
    if (!updated) throw new NotFoundException(`Task ${id} not found`);
    return updated;
  }

  async remove(workspaceId: string, userId: string, id: string) {
    await this.findOne(workspaceId, userId, id);
    const task = await this.plannerTasksRepository.softDelete(workspaceId, id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async reorder(
    workspaceId: string,
    userId: string,
    dto: ReorderPlannerTasksDto,
  ) {
    const updates = dto.ids.map((id, index) =>
      this.plannerTasksRepository.update(workspaceId, id, { order: index }),
    );
    await Promise.all(updates);
    return this.plannerTasksRepository.findByBlockId(workspaceId, dto.blockId);
  }
}
