import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { TimeEntry, TimeEntryDocument } from './time-tracking.schema';

@Injectable()
export class TimeTrackingRepository extends BaseRepository<TimeEntryDocument> {
  constructor(
    @InjectModel(TimeEntry.name)
    private readonly timeEntryModel: Model<TimeEntryDocument>,
  ) {
    super(timeEntryModel);
  }

  async findOpenBySession(
    workspaceId: string,
    sessionId: string,
  ): Promise<TimeEntryDocument | null> {
    return this.timeEntryModel
      .findOne({
        workspaceId,
        sessionId,
        endTime: null,
        isDeleted: false,
      })
      .sort({ startTime: -1 })
      .exec();
  }

  async findLastActivityByProject(
    workspaceId: string,
    projectIds: string[],
  ): Promise<Map<string, Date>> {
    if (!projectIds.length) return new Map();

    const results = await this.timeEntryModel.aggregate([
      {
        $match: {
          workspaceId,
          isDeleted: false,
          projectId: { $in: projectIds },
        },
      },
      { $group: { _id: '$projectId', lastActivityAt: { $max: '$startTime' } } },
    ]);

    return new Map(results.map((r) => [r._id, r.lastActivityAt]));
  }
}
