import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupabaseIntegrationRepository } from './supabase-integration.repository';
import { SupabaseMetricsSnapshotRepository } from './supabase-metrics-snapshot.repository';
import { ProjectsService } from '../projects/projects.service';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { ConnectSupabaseDto } from './dto/connect-supabase.dto';
import { LinkSupabaseProjectDto } from './dto/link-project.dto';

const MANAGEMENT_API_URL = 'https://api.supabase.com/api/v1';

// Prometheus metric names to extract from the Metrics API response
const TRACKED_METRICS = [
  'node_cpu_usage_seconds_total',
  'node_memory_MemAvailable_bytes',
  'node_memory_MemTotal_bytes',
  'node_filesystem_avail_bytes',
  'node_filesystem_size_bytes',
  'node_disk_read_bytes_total',
  'node_disk_written_bytes_total',
  'pg_stat_activity_count',
  'pg_stat_database_numbackends',
  'pg_postmaster_start_time_seconds',
];

interface SupabaseProject {
  id: string;
  ref: string;
  name: string;
  status: string;
  region: string;
  created_at: string;
  organization_id: string;
}

@Injectable()
export class SupabaseIntegrationService {
  constructor(
    private readonly supabaseRepository: SupabaseIntegrationRepository,
    private readonly snapshotRepository: SupabaseMetricsSnapshotRepository,
    private readonly projectsService: ProjectsService,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  private async callManagementApi<T = any>(
    pat: string,
    path: string,
  ): Promise<T> {
    const response = await fetch(`${MANAGEMENT_API_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${pat}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new BadRequestException(
        'Supabase Personal Access Token inválido o sin permisos suficientes.',
      );
    }

    if (!response.ok) {
      throw new BadRequestException(
        `Supabase Management API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  async scrapeMetrics(
    serviceRoleKey: string,
    projectRef: string,
  ): Promise<Record<string, number>> {
    const metricsUrl = `https://${projectRef}.supabase.co/customer/v1/privileged/metrics`;
    const credentials = Buffer.from(`${serviceRoleKey}:`).toString('base64');

    const response = await fetch(metricsUrl, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new BadRequestException(
        'Supabase service role key inválido para el Metrics API.',
      );
    }

    if (!response.ok) {
      throw new BadRequestException(
        `Supabase Metrics API error: ${response.status} ${response.statusText}`,
      );
    }

    const text = await response.text();
    return this.parsePrometheusMetrics(text);
  }

  private parsePrometheusMetrics(text: string): Record<string, number> {
    const result: Record<string, number> = {};

    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Format: metric_name{labels} value [timestamp]
      const spaceIdx = trimmed.lastIndexOf(' ');
      if (spaceIdx === -1) continue;

      const metricPart = trimmed.slice(0, spaceIdx);
      const valuePart = trimmed.slice(spaceIdx + 1).split(' ')[0];
      const value = parseFloat(valuePart);
      if (isNaN(value)) continue;

      // Strip labels to get the base metric name
      const braceIdx = metricPart.indexOf('{');
      const metricName =
        braceIdx === -1 ? metricPart : metricPart.slice(0, braceIdx);

      if (TRACKED_METRICS.includes(metricName)) {
        // For counters with multiple label sets, accumulate
        result[metricName] = (result[metricName] ?? 0) + value;
      }
    }

    return result;
  }

  private maskToken(token: string): string {
    if (token.length <= 8) return '****';
    return `${token.slice(0, 4)}${'*'.repeat(token.length - 8)}${token.slice(-4)}`;
  }

  private async requireConnection(
    workspaceId: string,
  ): Promise<{ pat: string; serviceRoleKey: string }> {
    const connection =
      await this.supabaseRepository.findByWorkspace(workspaceId);
    if (!connection) {
      throw new BadRequestException(
        'No hay conexión a Supabase configurada. Conectá tu cuenta primero.',
      );
    }
    return {
      pat: connection.personalAccessToken,
      serviceRoleKey: connection.serviceRoleKey,
    };
  }

  async connect(workspaceId: string, dto: ConnectSupabaseDto) {
    // Validate PAT by listing projects
    await this.callManagementApi(dto.personalAccessToken, '/projects');

    const connection = await this.supabaseRepository.upsertByWorkspace(
      workspaceId,
      {
        personalAccessToken: dto.personalAccessToken,
        serviceRoleKey: dto.serviceRoleKey,
      },
    );

    return {
      connected: true,
      _id: connection._id,
      connectedAt: connection.connectedAt,
      personalAccessToken: this.maskToken(connection.personalAccessToken),
      serviceRoleKey: this.maskToken(connection.serviceRoleKey),
    };
  }

  async disconnect(workspaceId: string) {
    const deleted =
      await this.supabaseRepository.softDeleteByWorkspace(workspaceId);
    if (!deleted)
      throw new NotFoundException(
        'No se encontró conexión a Supabase para este workspace.',
      );
    return { disconnected: true };
  }

  async getConnection(workspaceId: string) {
    const connection =
      await this.supabaseRepository.findByWorkspace(workspaceId);
    if (!connection) return { connected: false };
    return {
      connected: true,
      _id: connection._id,
      connectedAt: connection.connectedAt,
      tokenInvalid: connection.tokenInvalid,
      personalAccessToken: this.maskToken(connection.personalAccessToken),
      serviceRoleKey: this.maskToken(connection.serviceRoleKey),
    };
  }

  async listSupabaseProjects(workspaceId: string) {
    const { pat } = await this.requireConnection(workspaceId);
    const projects = await this.callManagementApi<SupabaseProject[]>(
      pat,
      '/projects',
    );
    return projects.map((p) => ({
      ref: p.ref,
      name: p.name,
      status: p.status,
      region: p.region,
      createdAt: p.created_at,
      organizationId: p.organization_id,
    }));
  }

  async getProjectStats(workspaceId: string, projectRef: string) {
    const { pat } = await this.requireConnection(workspaceId);
    const project = await this.callManagementApi<SupabaseProject>(
      pat,
      `/projects/${projectRef}`,
    );
    return {
      ref: project.ref,
      name: project.name,
      status: project.status,
      region: project.region,
      createdAt: project.created_at,
    };
  }

  async getProjectMetrics(
    workspaceId: string,
    projectRef: string,
    hours: number = 24,
  ) {
    const { serviceRoleKey } = await this.requireConnection(workspaceId);
    const metrics = await this.scrapeMetrics(serviceRoleKey, projectRef);

    const snapshots = await this.snapshotRepository.getLatestByProject(
      workspaceId,
      projectRef,
      hours * 12, // up to 12 snapshots per hour (every 5 min)
    );

    const history = snapshots
      .reverse()
      .map((s) => ({ snapshotAt: s.snapshotAt, metrics: s.metrics }));

    return { latest: metrics, history };
  }

  async getMetricsSummary(workspaceId: string, _hours: number = 24) {
    const { serviceRoleKey } = await this.requireConnection(workspaceId);

    const linkedProjects = await this.projectModel
      .find({
        workspaceId,
        isDeleted: false,
        supabaseProjectRef: { $ne: null },
      })
      .exec();

    if (!linkedProjects.length) return [];

    const results = await Promise.allSettled(
      linkedProjects.map(async (project) => {
        const ref = project.supabaseProjectRef as string;
        const metrics = await this.scrapeMetrics(serviceRoleKey, ref);
        return {
          orkpadProjectId: project._id.toString(),
          orkpadProjectName: project.name,
          supabaseProjectRef: ref,
          latest: metrics,
        };
      }),
    );

    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value);
  }

  async linkProject(
    workspaceId: string,
    projectId: string,
    dto: LinkSupabaseProjectDto,
  ) {
    await this.requireConnection(workspaceId);
    await this.projectsService.findOne(workspaceId, projectId);
    return this.projectsService.update(workspaceId, projectId, {
      supabaseProjectRef: dto.supabaseProjectRef,
    } as any);
  }

  async unlinkProject(workspaceId: string, projectId: string) {
    await this.projectsService.findOne(workspaceId, projectId);
    return this.projectsService.update(workspaceId, projectId, {
      supabaseProjectRef: null,
    } as any);
  }
}
