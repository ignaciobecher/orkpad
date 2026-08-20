import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  SocialAccount,
  SocialAccountDocument,
  SocialAccountContentPillar,
  SocialAccountMessageTemplate,
} from './social-account.schema';

@Injectable()
export class SocialIdentityRepository extends BaseRepository<SocialAccountDocument> {
  constructor(
    @InjectModel(SocialAccount.name)
    private readonly socialAccountModel: Model<SocialAccountDocument>,
  ) {
    super(socialAccountModel);
  }

  async addContentPillar(
    workspaceId: string,
    id: string,
    pillar: SocialAccountContentPillar,
  ): Promise<SocialAccountDocument | null> {
    return this.socialAccountModel
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $push: { contentPillars: pillar } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async removeContentPillar(
    workspaceId: string,
    id: string,
    pillarId: string,
  ): Promise<SocialAccountDocument | null> {
    return this.socialAccountModel
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $pull: { contentPillars: { _id: pillarId } } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async addMessageTemplate(
    workspaceId: string,
    id: string,
    template: SocialAccountMessageTemplate,
  ): Promise<SocialAccountDocument | null> {
    return this.socialAccountModel
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $push: { messageTemplates: template } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async removeMessageTemplate(
    workspaceId: string,
    id: string,
    templateId: string,
  ): Promise<SocialAccountDocument | null> {
    return this.socialAccountModel
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $pull: { messageTemplates: { _id: templateId } } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async addWeeklyMetric(
    workspaceId: string,
    id: string,
    metric: Record<string, any>,
  ): Promise<SocialAccountDocument | null> {
    return this.socialAccountModel
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $push: { weeklyMetrics: { ...metric, recordedAt: new Date() } } },
        { returnDocument: 'after' },
      )
      .exec();
  }
}
