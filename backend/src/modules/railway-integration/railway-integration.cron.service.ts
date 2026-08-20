import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from '../notifications/notifications.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { Workspace, WorkspaceDocument } from '../workspaces/workspaces.schema';
import {
  RailwayConnection,
  RailwayConnectionDocument,
} from './railway-integration.schema';
import { RailwayIntegrationRepository } from './railway-integration.repository';
import { RailwayDeploymentSnapshotRepository } from './railway-deployment-snapshot.repository';

const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v2';

const FAILED_STATUSES = ['FAILED', 'CRASHED'];
const MAX_CONSECUTIVE_ERRORS = 3;
const SNAPSHOT_RETENTION_DAYS = 90;

class RailwayAuthError extends Error {}

@Injectable()
export class RailwayCronService {
  private readonly logger = new Logger(RailwayCronService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(RailwayConnection.name)
    private readonly connectionModel: Model<RailwayConnectionDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly railwayRepository: RailwayIntegrationRepository,
    private readonly snapshotRepository: RailwayDeploymentSnapshotRepository,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkDeploymentStatuses() {
    this.logger.log('Checking Railway deployment statuses...');

    const connections = await this.connectionModel
      .find({ isDeleted: false })
      .exec();
    if (!connections.length) return;

    for (const connection of connections) {
      try {
        await this.checkWorkspaceDeployments(
          connection.workspaceId,
          connection.apiToken,
        );
        await this.railwayRepository.markHealthy(connection.workspaceId);
      } catch (err) {
        this.logger.error(
          `Error checking Railway deployments for workspace ${connection.workspaceId}: ${err}`,
        );
        await this.handleWorkspaceError(connection.workspaceId);
      }
    }

    const cutoff = new Date(
      Date.now() - SNAPSHOT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );
    await this.snapshotRepository.pruneOlderThan(cutoff);
  }

  private async handleWorkspaceError(workspaceId: string) {
    const connection = await this.railwayRepository.markError(workspaceId);
    if (!connection) return;

    if (
      connection.consecutiveErrorCount >= MAX_CONSECUTIVE_ERRORS &&
      !connection.tokenInvalid
    ) {
      await this.railwayRepository.markTokenInvalid(workspaceId);

      const workspace = await this.workspaceModel
        .findOne({ _id: workspaceId, isDeleted: false })
        .exec();
      if (!workspace) return;

      await this.notificationsService.create(workspaceId, {
        userId: workspace.ownerId,
        title: 'Tu conexión a Railway necesita renovarse',
        message:
          'No pudimos consultar tus deployments de Railway. Verificá que tu token de acceso siga siendo válido.',
        type: 'error',
        link: '/app/integrations',
        refId: workspaceId,
        refType: 'railway_token_invalid',
      });
    }
  }

  private async checkWorkspaceDeployments(
    workspaceId: string,
    apiToken: string,
  ) {
    const workspace = await this.workspaceModel
      .findOne({ _id: workspaceId, isDeleted: false })
      .exec();
    if (!workspace) return;

    const linkedProjects = await this.projectModel
      .find({
        workspaceId,
        isDeleted: false,
        railwayProjectId: { $ne: null },
      })
      .exec();

    if (!linkedProjects.length) return;

    let authError: unknown = null;

    for (const project of linkedProjects) {
      try {
        const deployments = await this.fetchRecentDeployments(
          apiToken,
          project.railwayProjectId!,
        );
        for (const deploy of deployments) {
          await this.snapshotRepository.upsertDeployment(workspaceId, {
            orkpadProjectId: project._id.toString(),
            railwayProjectId: project.railwayProjectId!,
            railwayDeploymentId: deploy.id,
            serviceId: deploy.service?.id ?? '',
            serviceName: deploy.service?.name ?? '',
            status: deploy.status,
            deployedAt: new Date(deploy.createdAt),
          });

          if (FAILED_STATUSES.includes(deploy.status)) {
            await this.createDeployFailedNotification(
              workspaceId,
              workspace.ownerId,
              project._id.toString(),
              project.name,
              deploy,
            );
          }
        }
      } catch (err) {
        this.logger.error(
          `Error fetching deployments for project ${project._id}: ${err}`,
        );
        if (err instanceof RailwayAuthError) authError = err;
      }
    }

    if (authError) throw authError;
  }

  private async fetchRecentDeployments(
    token: string,
    railwayProjectId: string,
  ) {
    const response = await fetch(RAILWAY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query($id: String!) {
          project(id: $id) {
            services {
              edges {
                node {
                  id
                  name
                  deployments(first: 5) {
                    edges {
                      node {
                        id
                        status
                        createdAt
                        meta
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
        variables: { id: railwayProjectId },
      }),
    });

    if (response.status === 401 || response.status === 403) {
      throw new RailwayAuthError(`Railway API auth error: ${response.status}`);
    }
    if (!response.ok)
      throw new Error(
        `Railway API error: ${response.status} ${response.statusText}`,
      );
    const json = await response.json();
    if (json.errors?.length)
      throw new Error(`Railway API error: ${json.errors[0].message}`);
    return (json.data?.project?.services?.edges ?? []).flatMap(
      (serviceEdge: any) =>
        serviceEdge.node.deployments.edges.map((depEdge: any) => ({
          ...depEdge.node,
          service: { id: serviceEdge.node.id, name: serviceEdge.node.name },
        })),
    );
  }

  private async createDeployFailedNotification(
    workspaceId: string,
    userId: string,
    projectId: string,
    projectName: string,
    deploy: {
      id: string;
      status: string;
      service?: { name: string };
      meta?: any;
    },
  ) {
    const exists = await this.notificationModel
      .findOne({
        workspaceId,
        refId: deploy.id,
        refType: 'railway_deploy_failed',
      })
      .exec();

    if (exists) return;

    const serviceName = deploy.service?.name ?? 'servicio';
    const commitMsg = deploy.meta?.commitMessage
      ? ` — "${deploy.meta.commitMessage}"`
      : '';
    const statusLabel =
      deploy.status === 'CRASHED' ? 'caído (crashed)' : 'fallido';

    await this.notificationsService.create(workspaceId, {
      userId,
      title: `Deploy ${statusLabel} en ${projectName}`,
      message: `El deploy del ${serviceName}${commitMsg} en "${projectName}" ${deploy.status === 'CRASHED' ? 'se cayó' : 'falló'}.`,
      type: 'error',
      link: `/app/projects/${projectId}/railway`,
      refId: deploy.id,
      refType: 'railway_deploy_failed',
    });

    this.logger.warn(
      `Deploy failed notification created for project ${projectName} deploy ${deploy.id}`,
    );
  }
}
