import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { PlannerTask, PlannerTaskDocument } from './planner-tasks.schema';

@Injectable()
export class PlannerTasksRepository extends BaseRepository<PlannerTaskDocument> {
  constructor(
    @InjectModel(PlannerTask.name)
    private readonly plannerTaskModel: Model<PlannerTaskDocument>,
  ) {
    super(plannerTaskModel);
  }

  async findByBlockId(
    workspaceId: string,
    blockId: string,
  ): Promise<PlannerTaskDocument[]> {
    return this.plannerTaskModel
      .find({ workspaceId, blockId, isDeleted: false })
      .sort({ order: 1 })
      .exec();
  }
}
