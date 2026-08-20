import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Workspace, WorkspaceSchema } from '../workspaces/workspaces.schema';
import { Project, ProjectSchema } from '../projects/projects.schema';
import { SupabaseIntegrationController } from './supabase-integration.controller';
import { SupabaseIntegrationService } from './supabase-integration.service';
import { SupabaseIntegrationRepository } from './supabase-integration.repository';
import { SupabaseMetricsSnapshotRepository } from './supabase-metrics-snapshot.repository';
import { SupabaseCronService } from './supabase-integration.cron.service';
import {
  SupabaseConnection,
  SupabaseConnectionSchema,
} from './supabase-integration.schema';
import {
  SupabaseMetricsSnapshot,
  SupabaseMetricsSnapshotSchema,
} from './supabase-metrics-snapshot.schema';

@Module({
  imports: [
    ProjectsModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: SupabaseConnection.name, schema: SupabaseConnectionSchema },
      {
        name: SupabaseMetricsSnapshot.name,
        schema: SupabaseMetricsSnapshotSchema,
      },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [SupabaseIntegrationController],
  providers: [
    SupabaseIntegrationService,
    SupabaseIntegrationRepository,
    SupabaseMetricsSnapshotRepository,
    SupabaseCronService,
  ],
  exports: [SupabaseIntegrationService],
})
export class SupabaseIntegrationModule {}
