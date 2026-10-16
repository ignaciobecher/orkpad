import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProjectSharesModule } from '../project-shares/project-shares.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { TaskColumnsModule } from '../task-columns/task-columns.module';
import { TaskCommentsModule } from '../task-comments/task-comments.module';
import { TaskActivitiesModule } from '../task-activities/task-activities.module';
import { StorageModule } from '../storage/storage.module';
import { PortalService } from './portal.service';
import { PortalAuthGuard } from './portal-auth.guard';
import { PortalController, PortalPublicController } from './portal.controller';

@Module({
  imports: [
    JwtModule.register({}),
    ProjectSharesModule,
    ProjectsModule,
    TasksModule,
    TaskColumnsModule,
    TaskCommentsModule,
    TaskActivitiesModule,
    StorageModule,
  ],
  controllers: [PortalPublicController, PortalController],
  providers: [PortalService, PortalAuthGuard],
})
export class PortalModule {}
