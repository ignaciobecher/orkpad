import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Task, TaskDocument } from './tasks.schema';

@Injectable()
export class TasksRepository extends BaseRepository<TaskDocument> {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {
    super(taskModel);
  }

  async findPendingByProjectIds(
    workspaceId: string,
    projectIds: string[],
  ): Promise<TaskDocument[]> {
    if (!projectIds.length) return [];

    return this.taskModel
      .find({
        workspaceId,
        isDeleted: false,
        projectId: { $in: projectIds },
        status: { $nin: ['done', 'cancelled'] },
      })
      .sort({ dueDate: 1 })
      .exec();
  }

  async findLastUpdatedByProject(
    workspaceId: string,
    projectIds: string[],
  ): Promise<Map<string, Date>> {
    if (!projectIds.length) return new Map();

    const results = await this.taskModel.aggregate([
      {
        $match: {
          workspaceId,
          isDeleted: false,
          projectId: { $in: projectIds },
        },
      },
      { $group: { _id: '$projectId', lastUpdatedAt: { $max: '$updatedAt' } } },
    ]);

    return new Map(results.map((r) => [r._id, r.lastUpdatedAt]));
  }
}
