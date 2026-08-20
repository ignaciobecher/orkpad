import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  OutreachWeeklyGoal,
  OutreachWeeklyGoalDocument,
} from './outreach-weekly-goal.schema';

@Injectable()
export class OutreachWeeklyGoalRepository extends BaseRepository<OutreachWeeklyGoalDocument> {
  constructor(
    @InjectModel(OutreachWeeklyGoal.name)
    private readonly weeklyGoalModel: Model<OutreachWeeklyGoalDocument>,
  ) {
    super(weeklyGoalModel);
  }

  async findOrCreateForWeek(
    workspaceId: string,
    userId: string,
    weekStart: Date,
    weekEnd: Date,
    defaultTargetCount: number,
  ): Promise<OutreachWeeklyGoalDocument> {
    return this.weeklyGoalModel
      .findOneAndUpdate(
        { workspaceId, userId, weekStart, isDeleted: false },
        {
          $setOnInsert: {
            workspaceId,
            userId,
            weekStart,
            weekEnd,
            targetCount: defaultTargetCount,
            currentCount: 0,
            completed: false,
            isDeleted: false,
            deletedAt: null,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  async incrementCount(
    workspaceId: string,
    id: string,
    amount: number,
  ): Promise<OutreachWeeklyGoalDocument | null> {
    return this.weeklyGoalModel
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $inc: { currentCount: amount } },
        { returnDocument: 'after' },
      )
      .exec();
  }
}
