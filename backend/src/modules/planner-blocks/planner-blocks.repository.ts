import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { PlannerBlock, PlannerBlockDocument } from './planner-blocks.schema';

@Injectable()
export class PlannerBlocksRepository extends BaseRepository<PlannerBlockDocument> {
  constructor(
    @InjectModel(PlannerBlock.name)
    private readonly plannerBlockModel: Model<PlannerBlockDocument>,
  ) {
    super(plannerBlockModel);
  }

  async findByDateRange(
    workspaceId: string,
    userId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<PlannerBlockDocument[]> {
    return this.plannerBlockModel
      .find({
        workspaceId,
        userId,
        date: { $gte: dateFrom, $lte: dateTo },
        isDeleted: false,
      })
      .sort({ date: 1, order: 1 })
      .exec();
  }

  async findByDate(
    workspaceId: string,
    userId: string,
    date: string,
  ): Promise<PlannerBlockDocument[]> {
    return this.plannerBlockModel
      .find({ workspaceId, userId, date, isDeleted: false })
      .sort({ order: 1 })
      .exec();
  }

  async findByRecurrenceRule(
    workspaceId: string,
    recurrenceRuleId: string,
    fromDate?: string,
  ): Promise<PlannerBlockDocument[]> {
    const query: Record<string, any> = {
      workspaceId,
      recurrenceRuleId,
      isDeleted: false,
    };
    if (fromDate) query.date = { $gte: fromDate };
    return this.plannerBlockModel.find(query).sort({ date: 1 }).exec();
  }

  async softDeleteMany(workspaceId: string, ids: string[]): Promise<void> {
    await this.plannerBlockModel.updateMany(
      { _id: { $in: ids }, workspaceId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
  }
}
