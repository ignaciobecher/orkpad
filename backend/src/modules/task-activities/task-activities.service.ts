import { Injectable } from '@nestjs/common';
import { TaskActivitiesRepository } from './task-activities.repository';
import type { TaskActivityType } from './task-activity.schema';

@Injectable()
export class TaskActivitiesService {
  constructor(
    private readonly activitiesRepository: TaskActivitiesRepository,
  ) {}

  findByTask(workspaceId: string, taskId: string, page = 1, limit = 50) {
    return this.activitiesRepository.findByTask(
      workspaceId,
      taskId,
      page,
      limit,
    );
  }

  log(
    workspaceId: string,
    data: {
      taskId: string;
      projectId?: string;
      actorId?: string;
      actorName?: string;
      type: TaskActivityType;
      payload?: Record<string, any>;
    },
  ) {
    return this.activitiesRepository
      .create(workspaceId, {
        taskId: data.taskId,
        projectId: data.projectId,
        actorId: data.actorId,
        actorName: data.actorName,
        type: data.type,
        payload: data.payload ?? {},
      })
      .catch(() => null);
  }
}
