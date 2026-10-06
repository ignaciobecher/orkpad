import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoalsRepository } from './goals.repository';
import { GoalEntriesRepository } from './goal-entries.repository';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { QueryGoalDto } from './dto/query-goal.dto';
import {
  IncrementProgressDto,
  SetProgressDto,
} from './dto/register-progress.dto';
import { QueryGoalEntriesDto } from './dto/query-goal-entries.dto';
import { GoalDocument } from './goals.schema';
import { GoalEntryDocument } from './goal-entries.schema';
import {
  derivePeriodKey,
  derivePeriodRange,
  getPreviousPeriodKey,
} from './goals-period.util';

@Injectable()
export class GoalsService {
  constructor(
    private readonly goalsRepository: GoalsRepository,
    private readonly goalEntriesRepository: GoalEntriesRepository,
  ) {}

  async findAll(workspaceId: string, userId: string, query: QueryGoalDto) {
    await this.checkAndMarkExpiredTargets(workspaceId, userId);

    const { type, status, period, page, limit } = query;
    const filters: Record<string, any> = { userId };
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (period) filters.period = period;

    const result = await this.goalsRepository.findAll(workspaceId, filters, {
      page,
      limit,
      sort: { order: 1, createdAt: -1 },
    });

    const data = await Promise.all(
      result.data.map(async (goal) => ({
        ...(goal as any).toObject(),
        currentEntry: await this.getCurrentEntry(
          workspaceId,
          userId,
          String(goal._id),
          goal,
        ),
      })),
    );

    return { ...result, data };
  }

  async findOne(
    workspaceId: string,
    userId: string,
    id: string,
  ): Promise<GoalDocument> {
    const goal = await this.goalsRepository.findOneBy(workspaceId, {
      _id: id,
      userId,
    });
    if (!goal) throw new NotFoundException(`Goal ${id} not found`);
    return goal;
  }

  async create(workspaceId: string, userId: string, dto: CreateGoalDto) {
    this.validateTypePeriod(dto.type, dto.period);
    if (dto.type === 'target' && !dto.dueDate) {
      throw new BadRequestException(
        'dueDate is required for goals of type "target"',
      );
    }

    return this.goalsRepository.create(workspaceId, {
      ...dto,
      userId,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      targetCount: dto.targetCount ?? 1,
    });
  }

  async update(
    workspaceId: string,
    userId: string,
    id: string,
    dto: UpdateGoalDto,
  ) {
    const existing = await this.findOne(workspaceId, userId, id);
    const nextType = dto.type ?? existing.type;
    const nextPeriod = dto.period ?? existing.period;
    this.validateTypePeriod(nextType, nextPeriod);

    const updateData: Record<string, any> = { ...dto };
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.dueDate) updateData.dueDate = new Date(dto.dueDate);

    const goal = await this.goalsRepository.update(workspaceId, id, updateData);
    if (!goal) throw new NotFoundException(`Goal ${id} not found`);
    return goal;
  }

  async remove(workspaceId: string, userId: string, id: string) {
    await this.findOne(workspaceId, userId, id);
    await this.goalEntriesRepository.softDeleteByGoalId(workspaceId, id);
    const goal = await this.goalsRepository.softDelete(workspaceId, id);
    if (!goal) throw new NotFoundException(`Goal ${id} not found`);
    return goal;
  }

  async getCurrentEntry(
    workspaceId: string,
    userId: string,
    goalId: string,
    preloadedGoal?: GoalDocument,
  ): Promise<GoalEntryDocument> {
    const goal =
      preloadedGoal ?? (await this.findOne(workspaceId, userId, goalId));
    const periodKey = derivePeriodKey(
      new Date(),
      goal.period,
      goal.timezone || 'UTC',
    );
    const { periodStart, periodEnd } = derivePeriodRange(
      periodKey,
      goal.period,
    );

    return this.goalEntriesRepository.findOrCreateForPeriod(
      workspaceId,
      goalId,
      userId,
      goal.period,
      periodKey,
      periodStart,
      periodEnd,
      goal.targetCount,
    );
  }

  async getEntries(
    workspaceId: string,
    userId: string,
    goalId: string,
    query: QueryGoalEntriesDto,
  ) {
    await this.findOne(workspaceId, userId, goalId);
    const { from, to, page, limit } = query;

    return this.goalEntriesRepository.findHistory(
      workspaceId,
      goalId,
      {
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      },
      { page, limit },
    );
  }

  async incrementProgress(
    workspaceId: string,
    userId: string,
    goalId: string,
    dto: IncrementProgressDto,
  ) {
    const entry = await this.getCurrentEntry(workspaceId, userId, goalId);
    const amount = dto.amount ?? 1;

    const updated = await this.goalEntriesRepository.incrementCount(
      workspaceId,
      String(entry._id),
      amount,
    );
    if (!updated) throw new NotFoundException(`Goal entry not found`);

    return this.applyCompletionState(workspaceId, userId, goalId, updated);
  }

  async setProgress(
    workspaceId: string,
    userId: string,
    goalId: string,
    dto: SetProgressDto,
  ) {
    const entry = await this.getCurrentEntry(workspaceId, userId, goalId);

    const updated = await this.goalEntriesRepository.update(
      workspaceId,
      String(entry._id),
      {
        currentCount: dto.currentCount,
      },
    );
    if (!updated) throw new NotFoundException(`Goal entry not found`);

    return this.applyCompletionState(workspaceId, userId, goalId, updated);
  }

  async completeCurrentEntry(
    workspaceId: string,
    userId: string,
    goalId: string,
  ) {
    const entry = await this.getCurrentEntry(workspaceId, userId, goalId);

    const updated = await this.goalEntriesRepository.update(
      workspaceId,
      String(entry._id),
      {
        currentCount: Math.max(entry.currentCount, entry.targetCount),
        completed: true,
        completedAt: new Date(),
      },
    );
    if (!updated) throw new NotFoundException(`Goal entry not found`);

    await this.recalculateStreak(workspaceId, goalId);
    return updated;
  }

  async uncompleteCurrentEntry(
    workspaceId: string,
    userId: string,
    goalId: string,
  ) {
    const entry = await this.getCurrentEntry(workspaceId, userId, goalId);

    const updated = await this.goalEntriesRepository.update(
      workspaceId,
      String(entry._id),
      {
        completed: false,
        completedAt: null,
      },
    );
    if (!updated) throw new NotFoundException(`Goal entry not found`);

    await this.recalculateStreak(workspaceId, goalId);
    return updated;
  }

  async getSummary(workspaceId: string, userId: string) {
    await this.checkAndMarkExpiredTargets(workspaceId, userId);

    const dailyGoals = await this.goalsRepository.findAll(
      workspaceId,
      { userId, status: 'active', period: 'daily' },
      { limit: 200 },
    );
    const todayKey = derivePeriodKey(new Date(), 'daily', 'UTC');
    const habitsToday = await this.goalEntriesRepository.countTodaySummary(
      workspaceId,
      userId,
      'daily',
      [todayKey],
    );
    habitsToday.total = dailyGoals.total;

    const activeTargets = await this.goalsRepository.countDocuments(
      workspaceId,
      {
        userId,
        type: 'target',
        status: 'active',
      },
    );

    const allGoals = await this.goalsRepository.findAll(
      workspaceId,
      { userId },
      { limit: 500 },
    );
    const bestStreakOverall = allGoals.data.reduce(
      (max, goal: any) => Math.max(max, goal.bestStreak ?? 0),
      0,
    );

    return { habitsToday, activeTargets, bestStreakOverall };
  }

  async getGoalStats(workspaceId: string, userId: string, goalId: string) {
    const goal = await this.findOne(workspaceId, userId, goalId);
    const entries = await this.goalEntriesRepository.findAll(
      workspaceId,
      { goalId },
      { limit: 500 },
    );

    const totalEntries = entries.total;
    const completedEntries = entries.data.filter(
      (e: any) => e.completed,
    ).length;
    const completionRate =
      totalEntries > 0 ? completedEntries / totalEntries : 0;

    return {
      completionRate,
      currentStreak: goal.currentStreak,
      bestStreak: goal.bestStreak,
      totalEntries,
      completedEntries,
    };
  }

  private async applyCompletionState(
    workspaceId: string,
    userId: string,
    goalId: string,
    entry: GoalEntryDocument,
  ) {
    const shouldBeCompleted = entry.currentCount >= entry.targetCount;
    if (shouldBeCompleted === entry.completed) return entry;

    const updated = await this.goalEntriesRepository.update(
      workspaceId,
      String(entry._id),
      {
        completed: shouldBeCompleted,
        completedAt: shouldBeCompleted ? new Date() : null,
      },
    );

    await this.recalculateStreak(workspaceId, goalId);

    return updated ?? entry;
  }

  private async recalculateStreak(
    workspaceId: string,
    goalId: string,
  ): Promise<void> {
    const goal = await this.goalsRepository.findOne(workspaceId, goalId);
    if (!goal) return;

    if (goal.period === 'none') return;

    const currentKey = derivePeriodKey(
      new Date(),
      goal.period,
      goal.timezone || 'UTC',
    );
    const currentEntry = await this.goalEntriesRepository.findByPeriodKey(
      workspaceId,
      goalId,
      currentKey,
    );

    let currentStreak = 0;
    if (currentEntry?.completed) {
      currentStreak = 1;
      let cursorKey = currentKey;

      while (true) {
        const prevKey = getPreviousPeriodKey(cursorKey, goal.period);
        const prevEntry = await this.goalEntriesRepository.findByPeriodKey(
          workspaceId,
          goalId,
          prevKey,
        );
        if (prevEntry?.completed) {
          currentStreak += 1;
          cursorKey = prevKey;
        } else {
          break;
        }
      }
    }

    const bestStreak = Math.max(goal.bestStreak ?? 0, currentStreak);
    await this.goalsRepository.update(workspaceId, goalId, {
      currentStreak,
      bestStreak,
    });
  }

  private async checkAndMarkExpiredTargets(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    const now = new Date();
    const expiring = await this.goalsRepository.findAll(
      workspaceId,
      { userId, type: 'target', status: 'active' },
      { limit: 200 },
    );

    for (const goal of expiring.data as any[]) {
      if (!goal.dueDate || new Date(goal.dueDate) > now) continue;

      const entry = await this.goalEntriesRepository.findByPeriodKey(
        workspaceId,
        String(goal._id),
        'total',
      );
      const isCompleted = entry
        ? entry.currentCount >= entry.targetCount
        : false;

      await this.goalsRepository.update(workspaceId, String(goal._id), {
        status: isCompleted ? 'completed' : 'failed',
      });
    }
  }

  private validateTypePeriod(type: string, period: string): void {
    if (type === 'target' && period !== 'none') {
      throw new BadRequestException(
        'Goals of type "target" must have period "none"',
      );
    }
    if (type !== 'target' && period === 'none') {
      throw new BadRequestException(
        'Only goals of type "target" can have period "none"',
      );
    }
  }
}
