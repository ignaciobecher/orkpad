import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  GamificationProfile,
  GamificationProfileDocument,
} from './gamification-profile.schema';

@Injectable()
export class GamificationProfileRepository extends BaseRepository<GamificationProfileDocument> {
  constructor(
    @InjectModel(GamificationProfile.name)
    private readonly profileModel: Model<GamificationProfileDocument>,
  ) {
    super(profileModel);
  }

  async findOrCreateForUser(
    workspaceId: string,
    userId: string,
  ): Promise<GamificationProfileDocument> {
    return this.profileModel
      .findOneAndUpdate(
        { workspaceId, userId, isDeleted: false },
        {
          $setOnInsert: {
            workspaceId,
            userId,
            totalPoints: 0,
            level: 1,
            currentStreakDays: 0,
            bestStreakDays: 0,
            lastActivityDate: null,
            badges: [],
            stats: {},
            isDeleted: false,
            deletedAt: null,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }
}
