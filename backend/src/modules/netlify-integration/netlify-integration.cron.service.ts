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
  NetlifyConnection,
  NetlifyConnectionDocument,
} from './netlify-integration.schema';
import { NetlifyIntegrationRepository } from './netlify-integration.repository';
import { NetlifyDeploymentSnapshotRepository } from './netlify-deployment-snapshot.repository';

const NETLIFY_API_URL = 'https://api.netlify.com/api/v1';

const FAILED_STATUSES = ['error'];
const MAX_CONSECUTIVE_ERRORS = 3;
const SNAPSHOT_RETENTION_DAYS = 90;

class NetlifyAuthError extends Error {}

interface NetlifyDeployRaw {
  id: string;
  state: string;
  branch: string | null;
  created_at: string;
  deploy_time: number | null;
  error_message: string | null;
}

@Injectable()
export class NetlifyCronService {
  private readonly logger = new Logger(NetlifyCronService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(NetlifyConnection.name)
    private readonly connectionModel: Model<NetlifyConnectionDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly netlifyRepository: NetlifyIntegrationRepository,
    private readonly snapshotRepository: NetlifyDeploymentSnapshotRepository,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkDeploymentStatuses() {
    this.logger.log('Checking Netlify deployment statuses...');

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
        await this.netlifyRepository.markHealthy(connection.workspaceId);
      } catch (err) {
        this.logger.error(
          `Error checking Netlify deployments for workspace ${connection.workspaceId}: ${err}`,
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
    const connection = await this.netlifyRepository.markError(workspaceId);
    if (!connection) return;

    if (
      connection.consecutiveErrorCount >= MAX_CONSECUTIVE_ERRORS &&
      !connection.tokenInvalid
    ) {
      await this.netlifyRepository.markTokenInvalid(workspaceId);

      const workspace = await this.workspaceModel
        .findOne({ _id: workspaceId, isDeleted: false })
        .exec();
      if (!workspace) return;

      await this.notificationsService.create(workspaceId, {
        userId: workspace.ownerId,
        title: 'Tu conexión a Netlify necesita renovarse',
        message:
          'No pudimos consultar tus deploys de Netlify. Verificá que tu token de acceso siga siendo válido.',
        type: 'error',
        link: '/app/integrations',
        refId: workspaceId,
        refType: 'netlify_token_invalid',
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
        netlifySiteId: { $ne: null },
      })
      .exec();

    if (!linkedProjects.length) return;

    let authError: unknown = null;

    for (const project of linkedProjects) {
      try {
        const deploys = await this.fetchRecentDeploys(
          apiToken,
          project.netlifySiteId!,
        );
        for (const deploy of deploys) {
          await this.snapshotRepository.upsertDeployment(workspaceId, {
            orkpadProjectId: project._id.toString(),
            netlifySiteId: project.netlifySiteId!,
            netlifyDeployId: deploy.id,
            siteName: project.name,
            status: deploy.state,
            branch: deploy.branch,
            errorMessage: deploy.error_message,
            deployTime: deploy.deploy_time,
            deployedAt: new Date(deploy.created_at),
          });

          if (FAILED_STATUSES.includes(deploy.state)) {
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
          `Error fetching Netlify deploys for project ${project._id}: ${err}`,
        );
        if (err instanceof NetlifyAuthError) authError = err;
      }
    }

    if (authError) throw authError;
  }

  private async fetchRecentDeploys(
    token: string,
    netlifySiteId: string,
  ): Promise<NetlifyDeployRaw[]> {
    const response = await fetch(
      `${NETLIFY_API_URL}/sites/${netlifySiteId}/deploys?per_page=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status === 401 || response.status === 403) {
      throw new NetlifyAuthError(`Netlify API auth error: ${response.status}`);
    }
    if (!response.ok) {
      throw new Error(
        `Netlify API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<NetlifyDeployRaw[]>;
  }

  private async createDeployFailedNotification(
    workspaceId: string,
    userId: string,
    projectId: string,
    projectName: string,
    deploy: {
      id: string;
      state: string;
      branch: string | null;
      error_message: string | null;
    },
  ) {
    const exists = await this.notificationModel
      .findOne({
        workspaceId,
        refId: deploy.id,
        refType: 'netlify_deploy_failed',
      })
      .exec();

    if (exists) return;

    const branchInfo = deploy.branch ? ` de la rama "${deploy.branch}"` : '';

    await this.notificationsService.create(workspaceId, {
      userId,
      title: `Deploy fallido en ${projectName}`,
      message: `El deploy${branchInfo} en "${projectName}" falló.`,
      type: 'error',
      link: `/app/projects/${projectId}/netlify`,
      refId: deploy.id,
      refType: 'netlify_deploy_failed',
    });

    this.logger.warn(
      `Deploy failed notification created for project ${projectName} deploy ${deploy.id}`,
    );
  }
}
