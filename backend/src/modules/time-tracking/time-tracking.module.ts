import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { WorkSessionsModule } from '../work-sessions/work-sessions.module';
import { TimeTrackingController } from './time-tracking.controller';
import { TimeTrackingService } from './time-tracking.service';
import { TimeTrackingRepository } from './time-tracking.repository';
import { TimeEntry, TimeEntrySchema } from './time-tracking.schema';

@Module({
  imports: [
    ProjectsModule,
    TasksModule,
    UsersModule,
    WorkSessionsModule,
    MongooseModule.forFeature([
      { name: TimeEntry.name, schema: TimeEntrySchema },
    ]),
  ],
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService, TimeTrackingRepository],
  exports: [TimeTrackingService],
})
export class TimeTrackingModule {}
