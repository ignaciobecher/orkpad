import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { TaskColumn, TaskColumnDocument } from './task-columns.schema';

@Injectable()
export class TaskColumnsRepository extends BaseRepository<TaskColumnDocument> {
  constructor(
    @InjectModel(TaskColumn.name)
    private readonly taskColumnModel: Model<TaskColumnDocument>,
  ) {
    super(taskColumnModel);
  }

  async findAllOrdered(
    workspaceId: string,
    projectId: string,
  ): Promise<TaskColumnDocument[]> {
    return this.taskColumnModel
      .find({ workspaceId, projectId, isDeleted: false })
      .sort({ order: 1, createdAt: 1 })
      .exec();
  }
}
