import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RailwayIntegrationRepository } from './railway-integration.repository';
import { RailwayDeploymentSnapshotRepository } from './railway-deployment-snapshot.repository';
import { ProjectsService } from '../projects/projects.service';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { ConnectRailwayDto } from './dto/connect-railway.dto';
import { LinkProjectDto } from './dto/link-project.dto';

const FAILED_STATUSES = ['FAILED', 'CRASHED'];
const SUCCESS_STATUSES = ['SUCCESS'];

const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v2';

const RESOURCE_MEASUREMENTS = [
  'CPU_USAGE',
  'MEMORY_USAGE_GB',
  'DISK_USAGE_GB',
  'NETWORK_RX_GB',
  'NETWORK_TX_GB',
] as const;

interface RailwayMetricSample {
  ts: number;
  value: number;
}

interface RailwayMetricsResult {
  measurement: string;
  tags: { serviceId?: string | null };
  values: RailwayMetricSample[];
}

@Injectable()
export class RailwayIntegrationService {
  constructor(
    private readonly railwayRepository: RailwayIntegrationRepository,
    private readonly snapshotRepository: RailwayDeploymentSnapshotRepository,
    private readonly projectsService: ProjectsService,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  private async callRailwayApi<T = any>(
    token: string,
    query: string,
    variables: Record<string, any> = {},
  ): Promise<T> {
    const response = await fetch(RAILWAY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new BadRequestException(
        `Railway API error: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as {
      data?: T;
      errors?: { message: string }[];
    };

    if (json.errors?.length) {
      throw new BadRequestException(
        `Railway API error: ${json.errors[0].message}`,
      );
    }

    return json.data as T;
  }

  private async validateToken(token: string): Promise<void> {
    await this.callRailwayApi(
      token,
      `query { projects { edges { node { id } } } }`,
    );
  }

  private maskToken(token: string): string {
    if (token.length <= 8) return '****';
    return `${token.slice(0, 4)}${'*'.repeat(token.length - 8)}${token.slice(-4)}`;
  }

  async connect(workspaceId: string, dto: ConnectRailwayDto) {
    await this.validateToken(dto.apiToken);

    const connection = await this.railwayRepository.upsertByWorkspace(
      workspaceId,
      {
        apiToken: dto.apiToken,
        railwayTeamId: dto.teamId ?? null,
      },
    );

    return {
      connected: true,
      _id: connection._id,
      connectedAt: connection.connectedAt,
      teamId: connection.railwayTeamId,
      token: this.maskToken(connection.apiToken),
    };
  }

  async disconnect(workspaceId: string) {
    const deleted =
      await this.railwayRepository.softDeleteByWorkspace(workspaceId);
    if (!deleted)
      throw new NotFoundException(
        'No Railway connection found for this workspace',
      );
    return { disconnected: true };
  }

  async getConnection(workspaceId: string) {
    const connection =
      await this.railwayRepository.findByWorkspace(workspaceId);
    if (!connection) return { connected: false };
    return {
      connected: true,
      _id: connection._id,
      connectedAt: connection.connectedAt,
      teamId: connection.railwayTeamId,
      token: this.maskToken(connection.apiToken),
    };
  }

  private async requireConnection(workspaceId: string): Promise<string> {
    const connection =
      await this.railwayRepository.findByWorkspace(workspaceId);
    if (!connection)
      throw new BadRequestException(
        'No Railway connection found. Please connect your Railway account first.',
      );
    return connection.apiToken;
  }

  async getProjects(workspaceId: string) {
    const token = await this.requireConnection(workspaceId);

    const data = await this.callRailwayApi<{
      me: {
        workspaces: {
          id: string;
          name: string;
          projects: { edges: { node: { id: string; name: string } }[] };
        }[];
      };
    }>(
      token,
      `query {
        me {
          workspaces {
            id
            name
            projects {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }`,
    );

    return data.me.workspaces.flatMap((ws) =>
      ws.projects.edges.map((e) => ({ ...e.node, workspaceName: ws.name })),
    );
  }

  async getProjectServices(workspaceId: string, railwayProjectId: string) {
    const token = await this.requireConnection(workspaceId);

    const data = await this.callRailwayApi<{
      project: {
        services: {
          edges: { node: { id: string; name: string } }[];
        };
      };
    }>(
      token,
      `query($id: String!) {
        project(id: $id) {
          services {
            edges {
              node { id name }
            }
          }
        }
      }`,
      { id: railwayProjectId },
    );

    return data.project.services.edges.map((e) => e.node);
  }

  async getDeployments(workspaceId: string, railwayProjectId: string) {
    const token = await this.requireConnection(workspaceId);

    const data = await this.callRailwayApi<{
      project: {
        services: {
          edges: {
            node: {
              id: string;
              name: string;
              deployments: {
                edges: {
                  node: {
                    id: string;
                    status: string;
                    createdAt: string;
                    url: string | null;
                    meta: Record<string, any> | null;
                  };
                }[];
              };
            };
          }[];
        };
      };
    }>(
      token,
      `query($id: String!) {
        project(id: $id) {
          services {
            edges {
              node {
                id
                name
                deployments(first: 10) {
                  edges {
                    node {
                      id
                      status
                      createdAt
                      url
                      meta
                    }
                  }
                }
              }
            }
          }
        }
      }`,
      { id: railwayProjectId },
    );

    return data.project.services.edges
      .flatMap((serviceEdge) =>
        serviceEdge.node.deployments.edges.map((depEdge) => ({
          ...depEdge.node,
          service: { id: serviceEdge.node.id, name: serviceEdge.node.name },
        })),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async linkProject(
    workspaceId: string,
    projectId: string,
    dto: LinkProjectDto,
  ) {
    await this.requireConnection(workspaceId);
    await this.projectsService.findOne(workspaceId, projectId);
    return this.projectsService.update(workspaceId, projectId, {
      railwayProjectId: dto.railwayProjectId,
    } as any);
  }

  async unlinkProject(workspaceId: string, projectId: string) {
    await this.projectsService.findOne(workspaceId, projectId);
    return this.projectsService.update(workspaceId, projectId, {
      railwayProjectId: null,
    } as any);
  }

  async getOverview(workspaceId: string) {
    const token = await this.requireConnection(workspaceId);

    const linkedProjects = await this.projectModel
      .find({
        workspaceId,
        isDeleted: false,
        railwayProjectId: { $ne: null },
      })
      .exec();

    if (!linkedProjects.length) return [];

    const results = await Promise.allSettled(
      linkedProjects.map(async (project) => {
        const railwayProjectId = project.railwayProjectId as string;

        const projectData = await this.callRailwayApi<any>(
          token,
          `query($id: String!) {
            project(id: $id) {
              id
              name
              services {
                edges {
                  node {
                    id
                    name
                    deployments(first: 5) {
                      edges {
                        node {
                          id status createdAt url meta
                        }
                      }
                    }
                  }
                }
              }
            }
          }`,
          { id: railwayProjectId },
        );

        const services = (projectData.project.services.edges as any[]).map(
          (e: any) => ({
            id: e.node.id,
            name: e.node.name,
          }),
        );

        const deployments = (projectData.project.services.edges as any[])
          .flatMap((serviceEdge: any) =>
            serviceEdge.node.deployments.edges.map((depEdge: any) => ({
              ...depEdge.node,
              service: { id: serviceEdge.node.id, name: serviceEdge.node.name },
            })),
          )
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

        const latestDeployment = deployments[0] ?? null;

        return {
          orkpadProjectId: project._id.toString(),
          orkpadProjectName: project.name,
          railwayProjectId,
          services,
          latestDeployment,
          recentDeployments: deployments,
        };
      }),
    );

    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value);
  }

  private async fetchMetrics(
    token: string,
    args: {
      serviceId?: string;
      projectId?: string;
      startDate: Date;
      endDate: Date;
    },
  ): Promise<RailwayMetricsResult[]> {
    const data = await this.callRailwayApi<{ metrics: RailwayMetricsResult[] }>(
      token,
      `query($measurements: [MetricMeasurement!]!, $startDate: DateTime!, $endDate: DateTime, $serviceId: String, $projectId: String, $groupBy: [MetricTag!], $sampleRateSeconds: Int) {
        metrics(
          measurements: $measurements
          startDate: $startDate
          endDate: $endDate
          serviceId: $serviceId
          projectId: $projectId
          groupBy: $groupBy
          sampleRateSeconds: $sampleRateSeconds
        ) {
          measurement
          tags { serviceId }
          values { ts value }
        }
      }`,
      {
        measurements: RESOURCE_MEASUREMENTS,
        startDate: args.startDate.toISOString(),
        endDate: args.endDate.toISOString(),
        serviceId: args.serviceId,
        projectId: args.projectId,
        groupBy: args.serviceId ? undefined : ['SERVICE_ID'],
        sampleRateSeconds: 300,
      },
    );

    return data.metrics;
  }

  private summarizeMetrics(results: RailwayMetricsResult[]) {
    const series: Record<string, { ts: number; value: number }[]> = {};
    const latest: Record<string, number> = {};

    for (const result of results) {
      const sorted = [...result.values].sort((a, b) => a.ts - b.ts);
      series[result.measurement] = sorted.map((v) => ({
        ts: v.ts,
        value: v.value,
      }));
      if (sorted.length)
        latest[result.measurement] = sorted[sorted.length - 1].value;
    }

    return { series, latest };
  }

  async getServiceMetrics(
    workspaceId: string,
    railwayProjectId: string,
    serviceId: string,
    hours: number = 24,
  ) {
    const token = await this.requireConnection(workspaceId);
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);

    const results = await this.fetchMetrics(token, {
      serviceId,
      projectId: railwayProjectId,
      startDate,
      endDate,
    });
    return this.summarizeMetrics(results);
  }

  async getProjectMetricsSummary(workspaceId: string, hours: number = 24) {
    const token = await this.requireConnection(workspaceId);

    const linkedProjects = await this.projectModel
      .find({
        workspaceId,
        isDeleted: false,
        railwayProjectId: { $ne: null },
      })
      .exec();

    if (!linkedProjects.length) return [];

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);

    const results = await Promise.allSettled(
      linkedProjects.map(async (project) => {
        const railwayProjectId = project.railwayProjectId as string;
        const metrics = await this.fetchMetrics(token, {
          projectId: railwayProjectId,
          startDate,
          endDate,
        });

        const byService = new Map<string, RailwayMetricsResult[]>();
        for (const result of metrics) {
          const serviceId = result.tags.serviceId ?? 'unknown';
          const list = byService.get(serviceId) ?? [];
          list.push(result);
          byService.set(serviceId, list);
        }

        const services = Array.from(byService.entries()).map(
          ([serviceId, serviceResults]) => ({
            serviceId,
            ...this.summarizeMetrics(serviceResults),
          }),
        );

        return {
          orkpadProjectId: project._id.toString(),
          orkpadProjectName: project.name,
          railwayProjectId,
          services,
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

    const [linkedProjectsCount, rows, failedLast24h, activeServiceIds] =
      await Promise.all([
        this.projectModel.countDocuments({
          workspaceId,
          isDeleted: false,
          railwayProjectId: { $ne: null },
        }),
        this.snapshotRepository.getStats(workspaceId, since),
        this.snapshotRepository.countDocuments(workspaceId, {
          status: { $in: FAILED_STATUSES },
          deployedAt: { $gte: last24h },
        }),
        this.snapshotRepository.getActiveServiceIds(workspaceId, since),
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
      linkedProjectsCount,
      activeServicesCount: activeServiceIds.length,
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
