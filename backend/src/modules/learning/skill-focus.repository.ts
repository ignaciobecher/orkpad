import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { SkillFocus, SkillFocusDocument } from './skill-focus.schema';

@Injectable()
export class SkillFocusRepository extends BaseRepository<SkillFocusDocument> {
  constructor(
    @InjectModel(SkillFocus.name)
    private readonly skillFocusModel: Model<SkillFocusDocument>,
  ) {
    super(skillFocusModel);
  }

  async findCurrent(
    workspaceId: string,
    userId: string,
    now: Date,
  ): Promise<SkillFocusDocument | null> {
    return this.skillFocusModel
      .findOne({
        workspaceId,
        userId,
        status: 'active',
        weekStart: { $lte: now },
        weekEnd: { $gt: now },
        isDeleted: false,
      })
      .exec();
  }
}
