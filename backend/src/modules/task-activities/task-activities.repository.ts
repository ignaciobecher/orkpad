import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { TaskActivity, TaskActivityDocument } from './task-activity.schema';

@Injectable()
export class TaskActivitiesRepository extends BaseRepository<TaskActivityDocument> {
  constructor(
    @InjectModel(TaskActivity.name)
    private readonly activityModel: Model<TaskActivityDocument>,
  ) {
    super(activityModel);
  }

  findByTask(workspaceId: string, taskId: string, page = 1, limit = 50) {
    return this.findAll(
      workspaceId,
      { taskId },
      { page, limit: Math.min(limit, 100), sort: { createdAt: -1 } },
    );
  }
}
