import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskActivity, TaskActivitySchema } from './task-activity.schema';
import { TaskActivitiesRepository } from './task-activities.repository';
import { TaskActivitiesService } from './task-activities.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TaskActivity.name, schema: TaskActivitySchema },
    ]),
  ],
  providers: [TaskActivitiesService, TaskActivitiesRepository],
  exports: [TaskActivitiesService],
})
export class TaskActivitiesModule {}
