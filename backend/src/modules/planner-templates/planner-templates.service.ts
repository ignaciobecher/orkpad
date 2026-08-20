import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PlannerTemplatesRepository } from './planner-templates.repository';
import { PlannerBlocksRepository } from '../planner-blocks/planner-blocks.repository';
import { CreatePlannerTemplateDto } from './dto/create-planner-template.dto';
import { UpdatePlannerTemplateDto } from './dto/update-planner-template.dto';
import { QueryPlannerTemplateDto } from './dto/query-planner-template.dto';
import { CaptureDayTemplateDto } from './dto/capture-day-template.dto';

@Injectable()
export class PlannerTemplatesService {
  constructor(
    private readonly plannerTemplatesRepository: PlannerTemplatesRepository,
    private readonly plannerBlocksRepository: PlannerBlocksRepository,
  ) {}

  async findAll(
    workspaceId: string,
    userId: string,
    query: QueryPlannerTemplateDto,
  ) {
    const { type, profession, includePublic, search, page, limit } = query;
    const filters: Record<string, any> = {};
    if (type) filters.type = type;
    if (profession) filters.profession = profession;
    if (search) filters.name = { $regex: search, $options: 'i' };

    if (includePublic) {
      return this.plannerTemplatesRepository.findWithPublic(
        workspaceId,
        userId,
        filters,
        { page, limit },
      );
    }

    filters.userId = userId;
    return this.plannerTemplatesRepository.findAll(workspaceId, filters, {
      page,
      limit,
    });
  }

  async findOne(workspaceId: string, userId: string, id: string) {
    const template = await this.plannerTemplatesRepository.findOne(
      workspaceId,
      id,
    );
    if (!template) throw new NotFoundException(`Template ${id} not found`);
    const t = template as any;
    if (!t.isPublic && t.userId !== userId) throw new ForbiddenException();
    return template;
  }

  create(workspaceId: string, userId: string, dto: CreatePlannerTemplateDto) {
    return this.plannerTemplatesRepository.create(workspaceId, {
      ...dto,
      userId,
    });
  }

  async update(
    workspaceId: string,
    userId: string,
    id: string,
    dto: UpdatePlannerTemplateDto,
  ) {
    const template = await this.findOne(workspaceId, userId, id);
    if ((template as any).userId !== userId) throw new ForbiddenException();
    const updated = await this.plannerTemplatesRepository.update(
      workspaceId,
      id,
      dto,
    );
    if (!updated) throw new NotFoundException(`Template ${id} not found`);
    return updated;
  }

  async remove(workspaceId: string, userId: string, id: string) {
    const template = await this.findOne(workspaceId, userId, id);
    if ((template as any).userId !== userId) throw new ForbiddenException();
    const deleted = await this.plannerTemplatesRepository.softDelete(
      workspaceId,
      id,
    );
    if (!deleted) throw new NotFoundException(`Template ${id} not found`);
    return deleted;
  }

  async duplicate(workspaceId: string, userId: string, id: string) {
    const original = await this.findOne(workspaceId, userId, id);
    const o = original as any;
    return this.plannerTemplatesRepository.create(workspaceId, {
      name: `${o.name} (copia)`,
      description: o.description,
      type: o.type,
      profession: o.profession,
      isPublic: false,
      userId,
      blocks: o.blocks,
      tags: o.tags,
    });
  }

  async captureFromDay(
    workspaceId: string,
    userId: string,
    dto: CaptureDayTemplateDto,
  ) {
    const blocks = await this.plannerBlocksRepository.findByDate(
      workspaceId,
      userId,
      dto.date,
    );

    const templateBlocks = blocks.map((block: any) => ({
      title: block.title,
      startTime: block.startTime,
      endTime: block.endTime,
      category: block.category,
      color: block.color,
      icon: block.icon,
      priority: block.priority,
      isFocusBlock: block.isFocusBlock,
      tags: block.tags ?? [],
      tasks: [],
    }));

    return this.plannerTemplatesRepository.create(workspaceId, {
      name: dto.name,
      description: dto.description,
      type: 'day',
      profession: 'custom',
      isPublic: false,
      userId,
      blocks: templateBlocks,
      tags: [],
    });
  }

  async applyToDate(
    workspaceId: string,
    userId: string,
    id: string,
    targetDate: string,
  ) {
    const template = await this.findOne(workspaceId, userId, id);
    const t = template as any;

    const blockCreations = t.blocks.map((b: any, index: number) =>
      this.plannerBlocksRepository.create(workspaceId, {
        userId,
        date: targetDate,
        startTime: b.startTime,
        endTime: b.endTime,
        title: b.title,
        category: b.category ?? 'work',
        color: b.color ?? '#2563EB',
        icon: b.icon,
        priority: b.priority ?? 'medium',
        isFocusBlock: b.isFocusBlock ?? false,
        tags: b.tags ?? [],
        order: index,
        status: 'pending',
        templateId: id,
      }),
    );

    const created = await Promise.all(blockCreations);
    return { applied: created.length, blocks: created };
  }
}
