import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics for the workspace' })
  getStats(@WorkspaceId() workspaceId: string) {
    return this.dashboardService.getStats(workspaceId);
  }

  @Get('workload-constellation')
  @ApiOperation({
    summary:
      'Get per-project urgency/staleness data for the workload constellation view',
  })
  getWorkloadConstellation(@WorkspaceId() workspaceId: string) {
    return this.dashboardService.getWorkloadConstellation(workspaceId);
  }
}
