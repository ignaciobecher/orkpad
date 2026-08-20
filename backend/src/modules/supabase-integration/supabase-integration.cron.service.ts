import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { Workspace, WorkspaceDocument } from '../workspaces/workspaces.schema';
import {
  SupabaseConnection,
  SupabaseConnectionDocument,
} from './supabase-integration.schema';
import { SupabaseIntegrationRepository } from './supabase-integration.repository';
import { SupabaseMetricsSnapshotRepository } from './supabase-metrics-snapshot.repository';
import { SupabaseIntegrationService } from './supabase-integration.service';

const MAX_CONSECUTIVE_ERRORS = 3;
const SNAPSHOT_RETENTION_DAYS = 90;

class SupabaseAuthError extends Error {}

@Injectable()
export class SupabaseCronService {
  private readonly logger = new Logger(SupabaseCronService.name);

  constructor(
    @InjectModel(SupabaseConnection.name)
    private readonly connectionModel: Model<SupabaseConnectionDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly supabaseRepository: SupabaseIntegrationRepository,
    private readonly snapshotRepository: SupabaseMetricsSnapshotRepository,
    private readonly supabaseService: SupabaseIntegrationService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async collectMetrics() {
    this.logger.log('Collecting Supabase metrics snapshots...');

    const connections = await this.connectionModel
      .find({ isDeleted: false, tokenInvalid: false })
      .exec();

    if (!connections.length) return;

    for (const connection of connections) {
      try {
        await this.collectWorkspaceMetrics(
          connection.workspaceId,
          connection.serviceRoleKey,
        );
        await this.supabaseRepository.markHealthy(connection.workspaceId);
      } catch (err) {
        this.logger.error(
          `Error collecting Supabase metrics for workspace ${connection.workspaceId}: ${err}`,
        );
        await this.handleWorkspaceError(
          connection.workspaceId,
          err instanceof SupabaseAuthError,
        );
      }
    }

    const cutoff = new Date(
      Date.now() - SNAPSHOT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );
    await this.snapshotRepository.pruneOlderThan(cutoff);
  }

  private async collectWorkspaceMetrics(
    workspaceId: string,
    serviceRoleKey: string,
  ) {
    const linkedProjects = await this.projectModel
      .find({
        workspaceId,
        isDeleted: false,
        supabaseProjectRef: { $ne: null },
      })
      .exec();

    if (!linkedProjects.length) return;

    let authError: unknown = null;

    for (const project of linkedProjects) {
      const ref = project.supabaseProjectRef as string;
      try {
        const metrics = await this.supabaseService.scrapeMetrics(
          serviceRoleKey,
          ref,
        );

        await this.snapshotRepository.saveSnapshot(workspaceId, {
          orkpadProjectId: project._id.toString(),
          supabaseProjectRef: ref,
          metrics,
        });
      } catch (err) {
        this.logger.error(
          `Error collecting metrics for project ${project._id} (ref: ${ref}): ${err}`,
        );
        if (err instanceof SupabaseAuthError) authError = err;
      }
    }

    if (authError) throw authError;
  }

  private async handleWorkspaceError(
    workspaceId: string,
    isAuthError: boolean,
  ) {
    const connection = await this.supabaseRepository.markError(workspaceId);
    if (!connection) return;

    const shouldInvalidate =
      isAuthError ||
      (connection.consecutiveErrorCount >= MAX_CONSECUTIVE_ERRORS &&
        !connection.tokenInvalid);

    if (shouldInvalidate) {
      await this.supabaseRepository.markTokenInvalid(workspaceId);

      const workspace = await this.workspaceModel
        .findOne({ _id: workspaceId, isDeleted: false })
        .exec();
      if (!workspace) return;

      await this.notificationsService.create(workspaceId, {
        userId: workspace.ownerId,
        title: 'Tu conexión a Supabase necesita renovarse',
        message:
          'No pudimos obtener métricas de Supabase. Verificá que tu service role key y personal access token sigan siendo válidos.',
        type: 'error',
        link: '/app/integrations',
        refId: workspaceId,
        refType: 'supabase_token_invalid',
      });
    }
  }
}
