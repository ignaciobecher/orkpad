import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Goal, GoalDocument } from './goals.schema';

@Injectable()
export class GoalsRepository extends BaseRepository<GoalDocument> {
  constructor(
    @InjectModel(Goal.name)
    private readonly goalModel: Model<GoalDocument>,
  ) {
    super(goalModel);
  }
}
