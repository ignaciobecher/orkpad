import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  LearningResource,
  LearningResourceDocument,
} from './learning-resource.schema';

@Injectable()
export class LearningResourceRepository extends BaseRepository<LearningResourceDocument> {
  constructor(
    @InjectModel(LearningResource.name)
    private readonly resourceModel: Model<LearningResourceDocument>,
  ) {
    super(resourceModel);
  }

  async incrementProgress(
    workspaceId: string,
    id: string,
    amount: number,
  ): Promise<LearningResourceDocument | null> {
    return this.resourceModel
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $inc: { currentProgress: amount } },
        { returnDocument: 'after' },
      )
      .exec();
  }
}
