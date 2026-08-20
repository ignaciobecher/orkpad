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
import { SupabaseIntegrationService } from './supabase-integration.service';
import { ConnectSupabaseDto } from './dto/connect-supabase.dto';
import { LinkSupabaseProjectDto } from './dto/link-project.dto';
import { SupabaseMetricsQueryDto } from './dto/supabase-metrics-query.dto';

@ApiTags('supabase')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('supabase')
export class SupabaseIntegrationController {
  constructor(private readonly supabaseService: SupabaseIntegrationService) {}

  @Get('connection')
  @ApiOperation({
    summary: 'Get Supabase connection status for this workspace',
  })
  getConnection(@WorkspaceId() workspaceId: string) {
    return this.supabaseService.getConnection(workspaceId);
  }

  @Post('connection')
  @ApiOperation({ summary: 'Connect Supabase account to this workspace' })
  connect(@WorkspaceId() workspaceId: string, @Body() dto: ConnectSupabaseDto) {
    return this.supabaseService.connect(workspaceId, dto);
  }

  @Delete('connection')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect Supabase account from this workspace' })
  disconnect(@WorkspaceId() workspaceId: string) {
    return this.supabaseService.disconnect(workspaceId);
  }

  @Get('projects')
  @ApiOperation({
    summary: 'List all Supabase projects available for this account',
  })
  listProjects(@WorkspaceId() workspaceId: string) {
    return this.supabaseService.listSupabaseProjects(workspaceId);
  }

  @Get('projects/:ref/stats')
  @ApiOperation({
    summary: 'Get stats for a Supabase project (status, region, info)',
  })
  getProjectStats(
    @WorkspaceId() workspaceId: string,
    @Param('ref') ref: string,
  ) {
    return this.supabaseService.getProjectStats(workspaceId, ref);
  }

  @Get('projects/:ref/metrics')
  @ApiOperation({
    summary: 'Get Prometheus metrics for a Supabase project (latest + history)',
  })
  getProjectMetrics(
    @WorkspaceId() workspaceId: string,
    @Param('ref') ref: string,
    @Query() query: SupabaseMetricsQueryDto,
  ) {
    return this.supabaseService.getProjectMetrics(
      workspaceId,
      ref,
      query.hours ?? 24,
    );
  }

  @Get('metrics/summary')
  @ApiOperation({
    summary:
      'Get latest Prometheus metrics for all Supabase-linked Orkpad projects',
  })
  getMetricsSummary(
    @WorkspaceId() workspaceId: string,
    @Query() query: SupabaseMetricsQueryDto,
  ) {
    return this.supabaseService.getMetricsSummary(
      workspaceId,
      query.hours ?? 24,
    );
  }

  @Post('link/:projectId')
  @ApiOperation({ summary: 'Link a Supabase project to an Orkpad project' })
  linkProject(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: LinkSupabaseProjectDto,
  ) {
    return this.supabaseService.linkProject(workspaceId, projectId, dto);
  }

  @Delete('link/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink Supabase project from an Orkpad project' })
  unlinkProject(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.supabaseService.unlinkProject(workspaceId, projectId);
  }
}
