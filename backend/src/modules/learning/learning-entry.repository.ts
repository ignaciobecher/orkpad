import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BaseRepository,
  PaginatedResult,
  PaginationOptions,
} from '../../common/base/base.repository';
import { LearningEntry, LearningEntryDocument } from './learning-entry.schema';

@Injectable()
export class LearningEntryRepository extends BaseRepository<LearningEntryDocument> {
  constructor(
    @InjectModel(LearningEntry.name)
    private readonly entryModel: Model<LearningEntryDocument>,
  ) {
    super(entryModel);
  }

  async findByDate(
    workspaceId: string,
    resourceId: string,
    date: string,
  ): Promise<LearningEntryDocument | null> {
    return this.entryModel
      .findOne({ workspaceId, resourceId, date, isDeleted: false })
      .exec();
  }

  async upsertForDate(
    workspaceId: string,
    resourceId: string,
    userId: string,
    date: string,
    unitsToAdd: number,
    note?: string,
  ): Promise<LearningEntryDocument> {
    const update: Record<string, any> = { $inc: { unitsLogged: unitsToAdd } };
    if (note) update.$set = { note };

    return this.entryModel
      .findOneAndUpdate(
        { workspaceId, resourceId, date, isDeleted: false },
        {
          ...update,
          $setOnInsert: {
            workspaceId,
            resourceId,
            userId,
            date,
            isDeleted: false,
            deletedAt: null,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  async findHistory(
    workspaceId: string,
    resourceId: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<LearningEntryDocument>> {
    return this.findAll(
      workspaceId,
      { resourceId },
      { sort: { date: -1 }, ...options },
    );
  }
}
