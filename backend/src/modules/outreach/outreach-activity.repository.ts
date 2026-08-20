import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  OutreachActivity,
  OutreachActivityDocument,
} from './outreach-activity.schema';

@Injectable()
export class OutreachActivityRepository extends BaseRepository<OutreachActivityDocument> {
  constructor(
    @InjectModel(OutreachActivity.name)
    private readonly activityModel: Model<OutreachActivityDocument>,
  ) {
    super(activityModel);
  }

  async countByOutcome(
    workspaceId: string,
    userId: string,
    outcome: string,
  ): Promise<number> {
    return this.activityModel.countDocuments({
      workspaceId,
      userId,
      outcome,
      isDeleted: false,
    });
  }
}
