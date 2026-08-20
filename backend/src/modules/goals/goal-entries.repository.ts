import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BaseRepository,
  PaginatedResult,
  PaginationOptions,
} from '../../common/base/base.repository';
import { GoalEntry, GoalEntryDocument } from './goal-entries.schema';

@Injectable()
export class GoalEntriesRepository extends BaseRepository<GoalEntryDocument> {
  constructor(
    @InjectModel(GoalEntry.name)
    private readonly goalEntryModel: Model<GoalEntryDocument>,
  ) {
    super(goalEntryModel);
  }

  async findOrCreateForPeriod(
    workspaceId: string,
    goalId: string,
    userId: string,
    periodType: 'daily' | 'weekly' | 'monthly' | 'none',
    periodKey: string,
    periodStart: Date,
    periodEnd: Date,
    targetCount: number,
  ): Promise<GoalEntryDocument> {
    return this.goalEntryModel
      .findOneAndUpdate(
        { workspaceId, goalId, periodKey, isDeleted: false },
        {
          $setOnInsert: {
            workspaceId,
            goalId,
            userId,
            periodType,
            periodKey,
            periodStart,
            periodEnd,
            targetCount,
            currentCount: 0,
            completed: false,
            completedAt: null,
            isDeleted: false,
            deletedAt: null,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  async findByPeriodKey(
    workspaceId: string,
    goalId: string,
    periodKey: string,
  ): Promise<GoalEntryDocument | null> {
    return this.goalEntryModel
      .findOne({ workspaceId, goalId, periodKey, isDeleted: false })
      .exec();
  }

  async incrementCount(
    workspaceId: string,
    entryId: string,
    amount: number,
  ): Promise<GoalEntryDocument | null> {
    return this.goalEntryModel
      .findOneAndUpdate(
        { _id: entryId, workspaceId, isDeleted: false },
        { $inc: { currentCount: amount } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async findHistory(
    workspaceId: string,
    goalId: string,
    filters: { from?: Date; to?: Date } = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<GoalEntryDocument>> {
    const dateFilter: Record<string, any> = {};
    if (filters.from) dateFilter.$gte = filters.from;
    if (filters.to) dateFilter.$lte = filters.to;

    const queryFilters: Record<string, any> = { goalId };
    if (filters.from || filters.to) queryFilters.periodStart = dateFilter;

    return this.findAll(workspaceId, queryFilters, {
      sort: { periodStart: -1 },
      ...options,
    });
  }

  async softDeleteByGoalId(workspaceId: string, goalId: string): Promise<void> {
    await this.goalEntryModel
      .updateMany(
        { workspaceId, goalId, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      )
      .exec();
  }

  async countTodaySummary(
    workspaceId: string,
    userId: string,
    periodType: 'daily' | 'weekly' | 'monthly' | 'none',
    periodKeys: string[],
  ): Promise<{ completed: number; total: number }> {
    const total = await this.goalEntryModel.countDocuments({
      workspaceId,
      userId,
      periodType,
      periodKey: { $in: periodKeys },
      isDeleted: false,
    });
    const completed = await this.goalEntryModel.countDocuments({
      workspaceId,
      userId,
      periodType,
      periodKey: { $in: periodKeys },
      completed: true,
      isDeleted: false,
    });
    return { completed, total };
  }
}
