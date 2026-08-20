import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../tasks/tasks.schema';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class GithubWebhookService {
  private readonly logger = new Logger(GithubWebhookService.name);

  constructor(
    private readonly tasksService: TasksService,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

  verifySignature(secret: string, rawBody: Buffer, signature: string): boolean {
    const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature),
      );
    } catch {
      return false;
    }
  }

  async handlePushEvent(payload: any): Promise<void> {
    const commits: any[] = payload.commits ?? [];
    const pattern =
      /(?:closes?|fix(?:es)?|resolve[sd]?)\s+TASK-([a-f0-9]{24})/gi;

    for (const commit of commits) {
      const message: string = commit.message ?? '';
      let match: RegExpExecArray | null;
      pattern.lastIndex = 0;

      while ((match = pattern.exec(message)) !== null) {
        const taskId = match[1];
        try {
          const task = await this.taskModel
            .findOne({ _id: taskId, isDeleted: false })
            .exec();
          if (!task) continue;

          await this.tasksService.complete(task.workspaceId, taskId, {
            completed: true,
          });
          this.logger.log(
            `Task ${taskId} closed via commit ${commit.id?.slice(0, 7)}`,
          );
        } catch (err) {
          this.logger.warn(
            `Failed to close task ${taskId} from webhook: ${(err as Error).message}`,
          );
        }
      }
    }
  }

  async handlePullRequestEvent(payload: any): Promise<void> {
    if (payload.action === 'closed' && payload.pull_request?.merged) {
      this.logger.log(
        `PR #${payload.pull_request.number} merged — no auto-close configured`,
      );
    }
  }
}
