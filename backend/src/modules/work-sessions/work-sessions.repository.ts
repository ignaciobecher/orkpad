import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { WorkSession, WorkSessionDocument } from './work-sessions.schema';

@Injectable()
export class WorkSessionsRepository extends BaseRepository<WorkSessionDocument> {
  constructor(
    @InjectModel(WorkSession.name)
    private readonly workSessionModel: Model<WorkSessionDocument>,
  ) {
    super(workSessionModel);
  }

  async findActive(
    workspaceId: string,
    userId: string,
  ): Promise<WorkSessionDocument | null> {
    return this.model
      .findOne({ workspaceId, userId, endTime: null, isDeleted: false })
      .exec();
  }

  async endActive(
    workspaceId: string,
    id: string,
    endTime: Date,
  ): Promise<WorkSessionDocument | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false, endTime: null },
        { $set: { endTime } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async findAllStaleActive(
    olderThanDate: Date,
  ): Promise<WorkSessionDocument[]> {
    return this.model
      .find({
        endTime: null,
        isDeleted: false,
        startTime: { $lte: olderThanDate },
      })
      .exec();
  }
}
