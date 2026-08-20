import { NotFoundException, Injectable } from '@nestjs/common';
import { OutreachActivityRepository } from './outreach-activity.repository';
import { OutreachWeeklyGoalRepository } from './outreach-weekly-goal.repository';
import { CreateOutreachActivityDto } from './dto/create-outreach-activity.dto';
import { UpdateOutreachActivityDto } from './dto/update-outreach-activity.dto';
import { QueryOutreachActivityDto } from './dto/query-outreach-activity.dto';
import { SetWeeklyTargetDto } from './dto/set-weekly-target.dto';
import { GamificationService } from '../gamification/gamification.service';
import { GAMIFICATION_POINTS } from '../gamification/gamification.constants';
import { derivePeriodKey, derivePeriodRange } from '../goals/goals-period.util';

const DEFAULT_WEEKLY_TARGET = 10;

function todayDateKey(): string {
  return new Date().toISOString().split('T')[0];
}

@Injectable()
export class OutreachService {
  constructor(
    private readonly activityRepository: OutreachActivityRepository,
    private readonly weeklyGoalRepository: OutreachWeeklyGoalRepository,
    private readonly gamificationService: GamificationService,
  ) {}

  async findAllActivities(
    workspaceId: string,
    userId: string,
    query: QueryOutreachActivityDto,
  ) {
    const { type, outcome, page, limit } = query;
    const filters: Record<string, any> = { userId };
    if (type) filters.type = type;
    if (outcome) filters.outcome = outcome;

    return this.activityRepository.findAll(workspaceId, filters, {
      page,
      limit,
      sort: { date: -1 },
    });
  }

  async logActivity(
    workspaceId: string,
    userId: string,
    dto: CreateOutreachActivityDto,
  ) {
    const activity = await this.activityRepository.create(workspaceId, {
      ...dto,
      userId,
      date: todayDateKey(),
      outcome: dto.outcome ?? 'pending',
    });

    const weeklyGoal = await this.getCurrentWeek(workspaceId, userId);
    const updatedGoal = await this.weeklyGoalRepository.incrementCount(
      workspaceId,
      String(weeklyGoal._id),
      1,
    );

    await this.gamificationService.awardPoints(workspaceId, userId, {
      type: 'outreach_activity',
      points: GAMIFICATION_POINTS.OUTREACH_ACTIVITY,
      refId: String(activity._id),
      refType: 'outreach_activity',
      statKey: 'outreachActivitiesLogged',
    });

    if (
      updatedGoal &&
      !updatedGoal.completed &&
      updatedGoal.currentCount >= updatedGoal.targetCount
    ) {
      await this.weeklyGoalRepository.update(
        workspaceId,
        String(updatedGoal._id),
        { completed: true },
      );
      await this.gamificationService.awardPoints(workspaceId, userId, {
        type: 'outreach_goal_complete',
        points: GAMIFICATION_POINTS.OUTREACH_GOAL_COMPLETE,
        refId: String(updatedGoal._id),
        refType: 'outreach_goal_complete',
      });
    }

    return activity;
  }

  async updateActivity(
    workspaceId: string,
    userId: string,
    id: string,
    dto: UpdateOutreachActivityDto,
  ) {
    const existing = await this.activityRepository.findOneBy(workspaceId, {
      _id: id,
      userId,
    });
    if (!existing)
      throw new NotFoundException(`Outreach activity ${id} not found`);

    const activity = await this.activityRepository.update(workspaceId, id, dto);
    if (!activity)
      throw new NotFoundException(`Outreach activity ${id} not found`);
    return activity;
  }

  async removeActivity(workspaceId: string, userId: string, id: string) {
    const existing = await this.activityRepository.findOneBy(workspaceId, {
      _id: id,
      userId,
    });
    if (!existing)
      throw new NotFoundException(`Outreach activity ${id} not found`);

    const activity = await this.activityRepository.softDelete(workspaceId, id);
    if (!activity)
      throw new NotFoundException(`Outreach activity ${id} not found`);
    return activity;
  }

  async getCurrentWeek(workspaceId: string, userId: string) {
    const weekKey = derivePeriodKey(new Date(), 'weekly', 'UTC');
    const { periodStart, periodEnd } = derivePeriodRange(weekKey, 'weekly');
    return this.weeklyGoalRepository.findOrCreateForWeek(
      workspaceId,
      userId,
      periodStart,
      periodEnd,
      DEFAULT_WEEKLY_TARGET,
    );
  }

  async setWeeklyTarget(
    workspaceId: string,
    userId: string,
    dto: SetWeeklyTargetDto,
  ) {
    const current = await this.getCurrentWeek(workspaceId, userId);
    const updated = await this.weeklyGoalRepository.update(
      workspaceId,
      String(current._id),
      {
        targetCount: dto.targetCount,
      },
    );
    if (!updated) throw new NotFoundException('Weekly outreach goal not found');
    return updated;
  }

  async getHistory(
    workspaceId: string,
    userId: string,
    query: { page?: number; limit?: number },
  ) {
    return this.weeklyGoalRepository.findAll(
      workspaceId,
      { userId },
      { sort: { weekStart: -1 }, ...query },
    );
  }

  async getStats(workspaceId: string, userId: string) {
    const [total, replied, converted, noResponse] = await Promise.all([
      this.activityRepository.countDocuments(workspaceId, { userId }),
      this.activityRepository.countByOutcome(workspaceId, userId, 'replied'),
      this.activityRepository.countByOutcome(workspaceId, userId, 'converted'),
      this.activityRepository.countByOutcome(
        workspaceId,
        userId,
        'no_response',
      ),
    ]);

    return {
      total,
      replied,
      converted,
      noResponse,
      responseRate: total > 0 ? (replied + converted) / total : 0,
      conversionRate: total > 0 ? converted / total : 0,
    };
  }
}
