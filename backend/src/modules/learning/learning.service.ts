import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LearningResourceRepository } from './learning-resource.repository';
import { LearningEntryRepository } from './learning-entry.repository';
import { SkillFocusRepository } from './skill-focus.repository';
import { CreateLearningResourceDto } from './dto/create-learning-resource.dto';
import { UpdateLearningResourceDto } from './dto/update-learning-resource.dto';
import { QueryLearningResourceDto } from './dto/query-learning-resource.dto';
import { LogLearningProgressDto } from './dto/log-progress.dto';
import { CreateSkillFocusDto } from './dto/create-skill-focus.dto';
import { UpdateSkillFocusDto } from './dto/update-skill-focus.dto';
import { GamificationService } from '../gamification/gamification.service';
import { GAMIFICATION_POINTS } from '../gamification/gamification.constants';
import { derivePeriodKey, derivePeriodRange } from '../goals/goals-period.util';

function todayDateKey(): string {
  return new Date().toISOString().split('T')[0];
}

@Injectable()
export class LearningService {
  constructor(
    private readonly resourceRepository: LearningResourceRepository,
    private readonly entryRepository: LearningEntryRepository,
    private readonly skillFocusRepository: SkillFocusRepository,
    private readonly gamificationService: GamificationService,
  ) {}

  // --- Resources ---

  async findAllResources(
    workspaceId: string,
    userId: string,
    query: QueryLearningResourceDto,
  ) {
    const { type, status, page, limit } = query;
    const filters: Record<string, any> = { userId };
    if (type) filters.type = type;
    if (status) filters.status = status;

    return this.resourceRepository.findAll(workspaceId, filters, {
      page,
      limit,
      sort: { order: 1, createdAt: -1 },
    });
  }

  async findOneResource(workspaceId: string, userId: string, id: string) {
    const resource = await this.resourceRepository.findOneBy(workspaceId, {
      _id: id,
      userId,
    });
    if (!resource)
      throw new NotFoundException(`Learning resource ${id} not found`);
    return resource;
  }

  async createResource(
    workspaceId: string,
    userId: string,
    dto: CreateLearningResourceDto,
  ) {
    return this.resourceRepository.create(workspaceId, {
      ...dto,
      userId,
      unit: dto.unit ?? 'pages',
      totalUnits: dto.totalUnits ?? null,
      dailyGoalUnits: dto.dailyGoalUnits ?? null,
      currentProgress: 0,
      status: 'planned',
    });
  }

  async updateResource(
    workspaceId: string,
    userId: string,
    id: string,
    dto: UpdateLearningResourceDto,
  ) {
    await this.findOneResource(workspaceId, userId, id);
    const resource = await this.resourceRepository.update(workspaceId, id, dto);
    if (!resource)
      throw new NotFoundException(`Learning resource ${id} not found`);
    return resource;
  }

  async removeResource(workspaceId: string, userId: string, id: string) {
    await this.findOneResource(workspaceId, userId, id);
    const resource = await this.resourceRepository.softDelete(workspaceId, id);
    if (!resource)
      throw new NotFoundException(`Learning resource ${id} not found`);
    return resource;
  }

  async logProgress(
    workspaceId: string,
    userId: string,
    id: string,
    dto: LogLearningProgressDto,
  ) {
    const resource = await this.findOneResource(workspaceId, userId, id);
    if (resource.status === 'completed' || resource.status === 'abandoned') {
      throw new BadRequestException(
        `Cannot log progress on a resource with status "${resource.status}"`,
      );
    }

    const date = todayDateKey();
    const entry = await this.entryRepository.upsertForDate(
      workspaceId,
      id,
      userId,
      date,
      dto.unitsLogged,
      dto.note,
    );

    const metMinimum = resource.dailyGoalUnits
      ? entry.unitsLogged >= resource.dailyGoalUnits
      : false;
    if (metMinimum !== entry.metMinimum) {
      await this.entryRepository.update(workspaceId, String(entry._id), {
        metMinimum,
      });
    }

    const updatedResource = await this.resourceRepository.incrementProgress(
      workspaceId,
      id,
      dto.unitsLogged,
    );
    if (!updatedResource)
      throw new NotFoundException(`Learning resource ${id} not found`);

    const startedAt = resource.startedAt ?? new Date();
    const patch: Record<string, any> = { startedAt, status: 'in_progress' };

    const isCompleted =
      updatedResource.totalUnits != null &&
      updatedResource.currentProgress >= updatedResource.totalUnits;
    if (isCompleted) {
      patch.status = 'completed';
      patch.completedAt = new Date();
    }

    const finalResource = await this.resourceRepository.update(
      workspaceId,
      id,
      patch,
    );

    if (metMinimum) {
      await this.gamificationService.awardPoints(workspaceId, userId, {
        type: 'learning_entry',
        points: GAMIFICATION_POINTS.LEARNING_ENTRY,
        refId: `${id}:${date}`,
        refType: 'learning_entry',
        statKey: 'learningEntriesLogged',
      });
    }

    if (isCompleted) {
      await this.gamificationService.awardPoints(workspaceId, userId, {
        type: 'resource_completed',
        points: GAMIFICATION_POINTS.RESOURCE_COMPLETED,
        refId: id,
        refType: 'resource_completed',
        statKey: 'resourcesCompleted',
      });
    }

    return finalResource;
  }

  async getEntries(
    workspaceId: string,
    userId: string,
    id: string,
    query: { page?: number; limit?: number },
  ) {
    await this.findOneResource(workspaceId, userId, id);
    return this.entryRepository.findHistory(workspaceId, id, query);
  }

  async getTodayProgress(workspaceId: string, userId: string) {
    const resources = await this.resourceRepository.findAll(
      workspaceId,
      { userId, status: 'in_progress' },
      { limit: 200 },
    );
    const date = todayDateKey();

    const items = await Promise.all(
      resources.data.map(async (resource: any) => {
        const entry = await this.entryRepository.findByDate(
          workspaceId,
          String(resource._id),
          date,
        );
        return {
          resource,
          unitsLoggedToday: entry?.unitsLogged ?? 0,
          metMinimum: entry?.metMinimum ?? false,
        };
      }),
    );

    return items.filter((item) => item.resource.dailyGoalUnits != null);
  }

  // --- Skill focus ---

  async getCurrentFocus(workspaceId: string, userId: string) {
    return this.skillFocusRepository.findCurrent(
      workspaceId,
      userId,
      new Date(),
    );
  }

  async setWeeklyFocus(
    workspaceId: string,
    userId: string,
    dto: CreateSkillFocusDto,
  ) {
    const weekKey = derivePeriodKey(new Date(), 'weekly', 'UTC');
    const { periodStart, periodEnd } = derivePeriodRange(weekKey, 'weekly');

    return this.skillFocusRepository.create(workspaceId, {
      ...dto,
      userId,
      weekStart: periodStart,
      weekEnd: periodEnd,
      status: 'active',
      resourceIds: dto.resourceIds ?? [],
    });
  }

  async updateFocus(
    workspaceId: string,
    userId: string,
    id: string,
    dto: UpdateSkillFocusDto,
  ) {
    const existing = await this.skillFocusRepository.findOneBy(workspaceId, {
      _id: id,
      userId,
    });
    if (!existing) throw new NotFoundException(`Skill focus ${id} not found`);

    const focus = await this.skillFocusRepository.update(workspaceId, id, dto);
    if (!focus) throw new NotFoundException(`Skill focus ${id} not found`);

    if (dto.status === 'completed' && existing.status !== 'completed') {
      await this.gamificationService.awardPoints(workspaceId, userId, {
        type: 'skill_focus_completed',
        points: GAMIFICATION_POINTS.SKILL_FOCUS_COMPLETED,
        refId: id,
        refType: 'skill_focus_completed',
        statKey: 'skillFociCompleted',
      });
    }

    return focus;
  }

  async getHistory(
    workspaceId: string,
    userId: string,
    query: { page?: number; limit?: number },
  ) {
    return this.skillFocusRepository.findAll(
      workspaceId,
      { userId },
      { sort: { weekStart: -1 }, ...query },
    );
  }
}
