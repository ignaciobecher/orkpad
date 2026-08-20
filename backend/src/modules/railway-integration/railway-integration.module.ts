import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  Notification,
  NotificationSchema,
} from '../notifications/notifications.schema';
import { Workspace, WorkspaceSchema } from '../workspaces/workspaces.schema';
import { Project, ProjectSchema } from '../projects/projects.schema';
import { RailwayIntegrationController } from './railway-integration.controller';
import { RailwayIntegrationService } from './railway-integration.service';
import { RailwayIntegrationRepository } from './railway-integration.repository';
import { RailwayDeploymentSnapshotRepository } from './railway-deployment-snapshot.repository';
import { RailwayCronService } from './railway-integration.cron.service';
import {
  RailwayConnection,
  RailwayConnectionSchema,
} from './railway-integration.schema';
import {
  RailwayDeploymentSnapshot,
  RailwayDeploymentSnapshotSchema,
} from './railway-deployment-snapshot.schema';

@Module({
  imports: [
    ProjectsModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: RailwayConnection.name, schema: RailwayConnectionSchema },
      {
        name: RailwayDeploymentSnapshot.name,
        schema: RailwayDeploymentSnapshotSchema,
      },
      { name: Notification.name, schema: NotificationSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [RailwayIntegrationController],
  providers: [
    RailwayIntegrationService,
    RailwayIntegrationRepository,
    RailwayDeploymentSnapshotRepository,
    RailwayCronService,
  ],
  exports: [RailwayIntegrationService],
})
export class RailwayIntegrationModule {}
