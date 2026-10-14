import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { TaskComment, TaskCommentDocument } from './task-comment.schema';

@Injectable()
export class TaskCommentsRepository extends BaseRepository<TaskCommentDocument> {
  constructor(
    @InjectModel(TaskComment.name)
    private readonly commentModel: Model<TaskCommentDocument>,
  ) {
    super(commentModel);
  }

  findByTask(workspaceId: string, taskId: string, page = 1, limit = 50) {
    return this.findAll(
      workspaceId,
      { taskId },
      { page, limit: Math.min(limit, 100), sort: { createdAt: 1 } },
    );
  }

  countByTask(workspaceId: string, taskId: string) {
    return this.countDocuments(workspaceId, { taskId });
  }
}
