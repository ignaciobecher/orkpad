import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PlannerBlocksRepository } from './planner-blocks.repository';
import { CreatePlannerBlockDto } from './dto/create-planner-block.dto';
import { UpdatePlannerBlockDto } from './dto/update-planner-block.dto';
import { QueryPlannerBlockDto } from './dto/query-planner-block.dto';
import { ReorderPlannerBlocksDto } from './dto/reorder-planner-blocks.dto';
import { CloneWeekDto } from './dto/clone-week.dto';
import { UpdateBlockStatusDto } from './dto/update-block-status.dto';

@Injectable()
export class PlannerBlocksService {
  constructor(
    private readonly plannerBlocksRepository: PlannerBlocksRepository,
  ) {}

  async findAll(
    workspaceId: string,
    userId: string,
    query: QueryPlannerBlockDto,
  ) {
    const { date, dateFrom, dateTo, status, category, page, limit } = query;

    if (date) {
      const blocks = await this.plannerBlocksRepository.findByDate(
        workspaceId,
        userId,
        date,
      );
      return {
        data: blocks,
        total: blocks.length,
        page: 1,
        limit: blocks.length,
      };
    }

    if (dateFrom && dateTo) {
      const dayDiff = this.daysBetween(dateFrom, dateTo);
      if (dayDiff > 31)
        throw new BadRequestException('Date range cannot exceed 31 days');
      const blocks = await this.plannerBlocksRepository.findByDateRange(
        workspaceId,
        userId,
        dateFrom,
        dateTo,
      );
      return {
        data: blocks,
        total: blocks.length,
        page: 1,
        limit: blocks.length,
      };
    }

    const filters: Record<string, any> = { userId };
    if (status) filters.status = status;
    if (category) filters.category = category;

    return this.plannerBlocksRepository.findAll(workspaceId, filters, {
      page,
      limit,
      sort: { date: 1, order: 1 },
    });
  }

  async findOne(workspaceId: string, userId: string, id: string) {
    const block = await this.plannerBlocksRepository.findOneBy(workspaceId, {
      _id: id,
      userId,
    });
    if (!block) throw new NotFoundException(`Block ${id} not found`);
    return block;
  }

  create(workspaceId: string, userId: string, dto: CreatePlannerBlockDto) {
    return this.plannerBlocksRepository.create(workspaceId, { ...dto, userId });
  }

  async update(
    workspaceId: string,
    userId: string,
    id: string,
    dto: UpdatePlannerBlockDto,
  ) {
    await this.findOne(workspaceId, userId, id);
    const block = await this.plannerBlocksRepository.update(
      workspaceId,
      id,
      dto,
    );
    if (!block) throw new NotFoundException(`Block ${id} not found`);
    return block;
  }

  async updateStatus(
    workspaceId: string,
    userId: string,
    id: string,
    dto: UpdateBlockStatusDto,
  ) {
    await this.findOne(workspaceId, userId, id);
    const block = await this.plannerBlocksRepository.update(workspaceId, id, {
      status: dto.status,
    });
    if (!block) throw new NotFoundException(`Block ${id} not found`);
    return block;
  }

  async remove(workspaceId: string, userId: string, id: string) {
    await this.findOne(workspaceId, userId, id);
    const block = await this.plannerBlocksRepository.softDelete(
      workspaceId,
      id,
    );
    if (!block) throw new NotFoundException(`Block ${id} not found`);
    return block;
  }

  async reorder(
    workspaceId: string,
    userId: string,
    dto: ReorderPlannerBlocksDto,
  ) {
    const updates = dto.ids.map((id, index) =>
      this.plannerBlocksRepository.update(workspaceId, id, { order: index }),
    );
    await Promise.all(updates);
    return this.plannerBlocksRepository.findByDate(
      workspaceId,
      userId,
      dto.date,
    );
  }

  async duplicate(
    workspaceId: string,
    userId: string,
    id: string,
    targetDate?: string,
  ) {
    const original = await this.findOne(workspaceId, userId, id);
    const data: Record<string, any> = {
      userId: (original as any).userId,
      date: targetDate ?? (original as any).date,
      startTime: (original as any).startTime,
      endTime: (original as any).endTime,
      title: (original as any).title,
      description: (original as any).description,
      category: (original as any).category,
      priority: (original as any).priority,
      color: (original as any).color,
      icon: (original as any).icon,
      timezone: (original as any).timezone,
      isFocusBlock: (original as any).isFocusBlock,
      tags: (original as any).tags,
      order: ((original as any).order ?? 0) + 1,
      status: 'pending',
    };
    return this.plannerBlocksRepository.create(workspaceId, data);
  }

  async cloneWeek(workspaceId: string, userId: string, dto: CloneWeekDto) {
    const { fromWeekStart, toWeekStart } = dto;
    const fromEnd = this.addDays(fromWeekStart, 6);
    const sourceBlocks = await this.plannerBlocksRepository.findByDateRange(
      workspaceId,
      userId,
      fromWeekStart,
      fromEnd,
    );

    if (sourceBlocks.length === 0) {
      return { cloned: 0 };
    }

    const fromDate = new Date(fromWeekStart);
    const toDate = new Date(toWeekStart);
    const dayOffset = Math.round(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const clones = sourceBlocks.map((block: any) => {
      const newDate = this.addDays(block.date, dayOffset);
      return this.plannerBlocksRepository.create(workspaceId, {
        userId,
        date: newDate,
        startTime: block.startTime,
        endTime: block.endTime,
        title: block.title,
        description: block.description,
        category: block.category,
        priority: block.priority,
        color: block.color,
        icon: block.icon,
        timezone: block.timezone,
        isFocusBlock: block.isFocusBlock,
        tags: block.tags,
        order: block.order,
        status: 'pending',
      });
    });

    const created = await Promise.all(clones);
    return { cloned: created.length };
  }

  private daysBetween(from: string, to: string): number {
    const a = new Date(from).getTime();
    const b = new Date(to).getTime();
    return Math.abs(Math.round((b - a) / (1000 * 60 * 60 * 24)));
  }

  private addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }
}
