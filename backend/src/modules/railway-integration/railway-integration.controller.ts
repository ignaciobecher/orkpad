import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { RailwayIntegrationService } from './railway-integration.service';
import { ConnectRailwayDto } from './dto/connect-railway.dto';
import { LinkProjectDto } from './dto/link-project.dto';
import { RailwayStatsQueryDto } from './dto/railway-stats-query.dto';
import { RailwayMetricsQueryDto } from './dto/railway-metrics-query.dto';

@ApiTags('railway')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('railway')
export class RailwayIntegrationController {
  constructor(private readonly railwayService: RailwayIntegrationService) {}

  @Get('connection')
  @ApiOperation({ summary: 'Get Railway connection status for this workspace' })
  getConnection(@WorkspaceId() workspaceId: string) {
    return this.railwayService.getConnection(workspaceId);
  }

  @Post('connection')
  @ApiOperation({ summary: 'Connect Railway account to this workspace' })
  connect(@WorkspaceId() workspaceId: string, @Body() dto: ConnectRailwayDto) {
    return this.railwayService.connect(workspaceId, dto);
  }

  @Delete('connection')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect Railway account from this workspace' })
  disconnect(@WorkspaceId() workspaceId: string) {
    return this.railwayService.disconnect(workspaceId);
  }

  @Get('overview')
  @ApiOperation({
    summary:
      'Get overview of all Railway-linked Orkpad projects with latest deployment status',
  })
  getOverview(@WorkspaceId() workspaceId: string) {
    return this.railwayService.getOverview(workspaceId);
  }

  @Get('stats')
  @ApiOperation({
    summary:
      'Get aggregated deployment stats for this workspace (from historical snapshots)',
  })
  getStats(
    @WorkspaceId() workspaceId: string,
    @Query() query: RailwayStatsQueryDto,
  ) {
    return this.railwayService.getStats(workspaceId, query.days ?? 30);
  }

  @Get('projects')
  @ApiOperation({ summary: 'List Railway projects for this workspace' })
  getProjects(@WorkspaceId() workspaceId: string) {
    return this.railwayService.getProjects(workspaceId);
  }

  @Get('projects/:railwayProjectId/services')
  @ApiOperation({ summary: 'List services for a Railway project' })
  getProjectServices(
    @WorkspaceId() workspaceId: string,
    @Param('railwayProjectId') railwayProjectId: string,
  ) {
    return this.railwayService.getProjectServices(
      workspaceId,
      railwayProjectId,
    );
  }

  @Get('projects/:railwayProjectId/services/:serviceId/metrics')
  @ApiOperation({
    summary:
      'Get resource usage metrics (CPU, memory, disk, network) for a service',
  })
  getServiceMetrics(
    @WorkspaceId() workspaceId: string,
    @Param('railwayProjectId') railwayProjectId: string,
    @Param('serviceId') serviceId: string,
    @Query() query: RailwayMetricsQueryDto,
  ) {
    return this.railwayService.getServiceMetrics(
      workspaceId,
      railwayProjectId,
      serviceId,
      query.hours ?? 24,
    );
  }

  @Get('metrics/summary')
  @ApiOperation({
    summary:
      'Get resource usage metrics (CPU, memory, disk, network) for all linked projects',
  })
  getMetricsSummary(
    @WorkspaceId() workspaceId: string,
    @Query() query: RailwayMetricsQueryDto,
  ) {
    return this.railwayService.getProjectMetricsSummary(
      workspaceId,
      query.hours ?? 24,
    );
  }

  @Get('projects/:railwayProjectId/deployments')
  @ApiOperation({ summary: 'List recent deployments for a Railway project' })
  getDeployments(
    @WorkspaceId() workspaceId: string,
    @Param('railwayProjectId') railwayProjectId: string,
  ) {
    return this.railwayService.getDeployments(workspaceId, railwayProjectId);
  }

  @Post('link/:projectId')
  @ApiOperation({ summary: 'Link a Railway project to an Orkpad project' })
  linkProject(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: LinkProjectDto,
  ) {
    return this.railwayService.linkProject(workspaceId, projectId, dto);
  }

  @Delete('link/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink Railway project from an Orkpad project' })
  unlinkProject(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.railwayService.unlinkProject(workspaceId, projectId);
  }
}
