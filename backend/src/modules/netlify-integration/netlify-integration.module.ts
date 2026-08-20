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
import { NetlifyIntegrationController } from './netlify-integration.controller';
import { NetlifyIntegrationService } from './netlify-integration.service';
import { NetlifyIntegrationRepository } from './netlify-integration.repository';
import { NetlifyDeploymentSnapshotRepository } from './netlify-deployment-snapshot.repository';
import { NetlifyCronService } from './netlify-integration.cron.service';
import {
  NetlifyConnection,
  NetlifyConnectionSchema,
} from './netlify-integration.schema';
import {
  NetlifyDeploymentSnapshot,
  NetlifyDeploymentSnapshotSchema,
} from './netlify-deployment-snapshot.schema';

@Module({
  imports: [
    ProjectsModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: NetlifyConnection.name, schema: NetlifyConnectionSchema },
      {
        name: NetlifyDeploymentSnapshot.name,
        schema: NetlifyDeploymentSnapshotSchema,
      },
      { name: Notification.name, schema: NotificationSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [NetlifyIntegrationController],
  providers: [
    NetlifyIntegrationService,
    NetlifyIntegrationRepository,
    NetlifyDeploymentSnapshotRepository,
    NetlifyCronService,
  ],
  exports: [NetlifyIntegrationService],
})
export class NetlifyIntegrationModule {}
