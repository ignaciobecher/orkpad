import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NetlifyIntegrationRepository } from './netlify-integration.repository';
import { NetlifyDeploymentSnapshotRepository } from './netlify-deployment-snapshot.repository';
import { ProjectsService } from '../projects/projects.service';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { ConnectNetlifyDto } from './dto/connect-netlify.dto';
import { LinkSiteDto } from './dto/link-site.dto';

const NETLIFY_API_URL = 'https://api.netlify.com/api/v1';

const FAILED_STATUSES = ['error'];
const SUCCESS_STATUSES = ['ready'];

class NetlifyAuthError extends Error {}

interface NetlifySiteRaw {
  id: string;
  name: string;
  url: string;
  published_deploy?: {
    id: string;
    state: string;
    created_at: string;
  } | null;
}

interface NetlifyDeployRaw {
  id: string;
  state: string;
  branch: string | null;
  created_at: string;
  deploy_time: number | null;
  error_message: string | null;
}

@Injectable()
export class NetlifyIntegrationService {
  constructor(
    private readonly netlifyRepository: NetlifyIntegrationRepository,
    private readonly snapshotRepository: NetlifyDeploymentSnapshotRepository,
    private readonly projectsService: ProjectsService,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  private async callNetlifyApi<T = any>(
    token: string,
    path: string,
  ): Promise<T> {
    const response = await fetch(`${NETLIFY_API_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new NetlifyAuthError(`Netlify API auth error: ${response.status}`);
    }

    if (!response.ok) {
      throw new BadRequestException(
        `Netlify API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  private async validateToken(token: string): Promise<void> {
    await this.callNetlifyApi(token, '/user');
  }

  private maskToken(token: string): string {
    if (token.length <= 8) return '****';
    return `${token.slice(0, 4)}${'*'.repeat(token.length - 8)}${token.slice(-4)}`;
  }

  private async requireConnection(workspaceId: string): Promise<string> {
    const connection =
      await this.netlifyRepository.findByWorkspace(workspaceId);
    if (!connection) {
      throw new BadRequestException(
        'No Netlify connection found. Please connect your Netlify account first.',
      );
    }
    return connection.apiToken;
  }

  async connect(workspaceId: string, dto: ConnectNetlifyDto) {
    await this.validateToken(dto.apiToken);

    const connection = await this.netlifyRepository.upsertByWorkspace(
      workspaceId,
      {
        apiToken: dto.apiToken,
      },
    );

    return {
      connected: true,
      _id: connection._id,
      connectedAt: connection.connectedAt,
      token: this.maskToken(connection.apiToken),
    };
  }

  async disconnect(workspaceId: string) {
    const deleted =
      await this.netlifyRepository.softDeleteByWorkspace(workspaceId);
    if (!deleted)
      throw new NotFoundException(
        'No Netlify connection found for this workspace',
      );
    return { disconnected: true };
  }

  async getConnection(workspaceId: string) {
    const connection =
      await this.netlifyRepository.findByWorkspace(workspaceId);
    if (!connection) return { connected: false };
    return {
      connected: true,
      _id: connection._id,
      connectedAt: connection.connectedAt,
      token: this.maskToken(connection.apiToken),
      tokenInvalid: connection.tokenInvalid,
    };
  }

  async getSites(workspaceId: string) {
    const token = await this.requireConnection(workspaceId);
    const sites = await this.callNetlifyApi<NetlifySiteRaw[]>(token, '/sites');
    return sites.map((s) => ({ id: s.id, name: s.name, url: s.url }));
  }

  async getDeployments(workspaceId: string, siteId: string) {
    const token = await this.requireConnection(workspaceId);
    const deploys = await this.callNetlifyApi<NetlifyDeployRaw[]>(
      token,
      `/sites/${siteId}/deploys?per_page=20`,
    );
    return deploys.map((d) => ({
      id: d.id,
      state: d.state,
      branch: d.branch,
      createdAt: d.created_at,
      deployTime: d.deploy_time,
      errorMessage: d.error_message,
    }));
  }

  async linkProject(workspaceId: string, projectId: string, dto: LinkSiteDto) {
    await this.requireConnection(workspaceId);
    await this.projectsService.findOne(workspaceId, projectId);
    return this.projectsService.update(workspaceId, projectId, {
      netlifySiteId: dto.netlifySiteId,
    } as any);
  }

  async unlinkProject(workspaceId: string, projectId: string) {
    await this.projectsService.findOne(workspaceId, projectId);
    return this.projectsService.update(workspaceId, projectId, {
      netlifySiteId: null,
    } as any);
  }

  async getOverview(workspaceId: string) {
    const token = await this.requireConnection(workspaceId);

    const linkedProjects = await this.projectModel
      .find({
        workspaceId,
        isDeleted: false,
        netlifySiteId: { $ne: null },
      })
      .exec();

    if (!linkedProjects.length) return [];

    const results = await Promise.allSettled(
      linkedProjects.map(async (project) => {
        const netlifySiteId = project.netlifySiteId as string;

        const [site, deploys] = await Promise.all([
          this.callNetlifyApi<NetlifySiteRaw>(token, `/sites/${netlifySiteId}`),
          this.callNetlifyApi<NetlifyDeployRaw[]>(
            token,
            `/sites/${netlifySiteId}/deploys?per_page=5`,
          ),
        ]);

        const recentDeploys = deploys.map((d) => ({
          id: d.id,
          state: d.state,
          branch: d.branch,
          createdAt: d.created_at,
          deployTime: d.deploy_time,
          errorMessage: d.error_message,
        }));

        const publishedDeploy = site.published_deploy
          ? {
              id: site.published_deploy.id,
              state: site.published_deploy.state,
              createdAt: site.published_deploy.created_at,
            }
          : null;

        return {
          orkpadProjectId: project._id.toString(),
          orkpadProjectName: project.name,
          netlifySiteId,
          siteName: site.name,
          siteUrl: site.url,
          publishedDeploy,
          recentDeploys,
        };
      }),
    );

    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value);
  }

  async getStats(workspaceId: string, days: number = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [linkedSitesCount, rows, failedLast24h, activeSiteIds] =
      await Promise.all([
        this.projectModel.countDocuments({
          workspaceId,
          isDeleted: false,
          netlifySiteId: { $ne: null },
        }),
        this.snapshotRepository.getStats(workspaceId, since),
        this.snapshotRepository.countDocuments(workspaceId, {
          status: { $in: FAILED_STATUSES },
          deployedAt: { $gte: last24h },
        }),
        this.snapshotRepository.getActiveSiteIds(workspaceId, since),
      ]);

    const byDayMap = new Map<
      string,
      { success: number; failed: number; other: number }
    >();
    const byStatusMap = new Map<string, number>();
    let totalCount = 0;
    let successCount = 0;

    for (const row of rows as {
      _id: { day: string; status: string };
      count: number;
    }[]) {
      const { day, status } = row._id;
      const count = row.count;
      totalCount += count;
      if (SUCCESS_STATUSES.includes(status)) successCount += count;

      byStatusMap.set(status, (byStatusMap.get(status) ?? 0) + count);

      const dayEntry = byDayMap.get(day) ?? { success: 0, failed: 0, other: 0 };
      if (SUCCESS_STATUSES.includes(status)) dayEntry.success += count;
      else if (FAILED_STATUSES.includes(status)) dayEntry.failed += count;
      else dayEntry.other += count;
      byDayMap.set(day, dayEntry);
    }

    return {
      linkedSitesCount,
      activeSitesCount: activeSiteIds.length,
      successRatePct:
        totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0,
      failedLast24h,
      byStatus: Array.from(byStatusMap.entries()).map(([status, count]) => ({
        status,
        count,
      })),
      byDay: Array.from(byDayMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, ...v })),
    };
  }
}
