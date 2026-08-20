import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { LeadSearch, LeadSearchDocument } from './lead-searches.schema';

@Injectable()
export class LeadSearchesRepository extends BaseRepository<LeadSearchDocument> {
  constructor(
    @InjectModel(LeadSearch.name)
    private readonly leadSearchModel: Model<LeadSearchDocument>,
  ) {
    super(leadSearchModel);
  }

  async findPending(): Promise<LeadSearchDocument[]> {
    return this.leadSearchModel
      .find({ status: 'pending', isDeleted: false })
      .sort({ createdAt: 1 })
      .limit(10)
      .exec();
  }

  async countRunningForWorkspace(workspaceId: string): Promise<number> {
    return this.leadSearchModel.countDocuments({
      workspaceId,
      status: 'running',
      isDeleted: false,
    });
  }

  async markRunning(id: string): Promise<LeadSearchDocument | null> {
    return this.leadSearchModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { status: 'running', startedAt: new Date() } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async markCompleted(
    id: string,
    totalFound: number,
    leadsImported: number,
  ): Promise<void> {
    await this.leadSearchModel.updateOne(
      { _id: id },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          totalFound,
          leadsImported,
        },
      },
    );
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.leadSearchModel.updateOne(
      { _id: id },
      { $set: { status: 'failed', completedAt: new Date(), error } },
    );
  }
}
