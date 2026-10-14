import { Module, forwardRef, Optional } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from '../tasks/tasks.schema';
import { TaskComment, TaskCommentSchema } from './task-comment.schema';
import { TaskCommentsRepository } from './task-comments.repository';
import { TaskCommentsService } from './task-comments.service';
import {
  TaskCommentsController,
  TaskActivitiesController,
} from './task-comments.controller';
import { TasksModule } from '../tasks/tasks.module';
import { TaskActivitiesModule } from '../task-activities/task-activities.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TaskComment.name, schema: TaskCommentSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
    forwardRef(() => TasksModule),
    TaskActivitiesModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [TaskCommentsController, TaskActivitiesController],
  providers: [TaskCommentsService, TaskCommentsRepository],
  exports: [TaskCommentsService],
})
export class TaskCommentsModule {}
