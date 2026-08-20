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
import { NetlifyIntegrationService } from './netlify-integration.service';
import { ConnectNetlifyDto } from './dto/connect-netlify.dto';
import { LinkSiteDto } from './dto/link-site.dto';
import { NetlifyStatsQueryDto } from './dto/netlify-stats-query.dto';

@ApiTags('netlify')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('netlify')
export class NetlifyIntegrationController {
  constructor(private readonly netlifyService: NetlifyIntegrationService) {}

  @Get('connection')
  @ApiOperation({ summary: 'Get Netlify connection status for this workspace' })
  getConnection(@WorkspaceId() workspaceId: string) {
    return this.netlifyService.getConnection(workspaceId);
  }

  @Post('connection')
  @ApiOperation({ summary: 'Connect Netlify account to this workspace' })
  connect(@WorkspaceId() workspaceId: string, @Body() dto: ConnectNetlifyDto) {
    return this.netlifyService.connect(workspaceId, dto);
  }

  @Delete('connection')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect Netlify account from this workspace' })
  disconnect(@WorkspaceId() workspaceId: string) {
    return this.netlifyService.disconnect(workspaceId);
  }

  @Get('overview')
  @ApiOperation({
    summary:
      'Get overview of all Netlify-linked Orkpad projects with latest deploy status',
  })
  getOverview(@WorkspaceId() workspaceId: string) {
    return this.netlifyService.getOverview(workspaceId);
  }

  @Get('stats')
  @ApiOperation({
    summary:
      'Get aggregated deploy stats for this workspace (from historical snapshots)',
  })
  getStats(
    @WorkspaceId() workspaceId: string,
    @Query() query: NetlifyStatsQueryDto,
  ) {
    return this.netlifyService.getStats(workspaceId, query.days ?? 30);
  }

  @Get('sites')
  @ApiOperation({ summary: 'List Netlify sites for this workspace account' })
  getSites(@WorkspaceId() workspaceId: string) {
    return this.netlifyService.getSites(workspaceId);
  }

  @Get('sites/:siteId/deploys')
  @ApiOperation({ summary: 'List recent deploys for a Netlify site' })
  getDeployments(
    @WorkspaceId() workspaceId: string,
    @Param('siteId') siteId: string,
  ) {
    return this.netlifyService.getDeployments(workspaceId, siteId);
  }

  @Post('link/:projectId')
  @ApiOperation({ summary: 'Link a Netlify site to an Orkpad project' })
  linkProject(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: LinkSiteDto,
  ) {
    return this.netlifyService.linkProject(workspaceId, projectId, dto);
  }

  @Delete('link/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink Netlify site from an Orkpad project' })
  unlinkProject(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.netlifyService.unlinkProject(workspaceId, projectId);
  }
}
