import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GrowthHubService } from './growth-hub.service';

@ApiTags('Growth Hub')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('growth')
export class GrowthHubController {
  constructor(private readonly growthHubService: GrowthHubService) {}

  @Get('summary')
  @ApiOperation({
    summary:
      'Get the aggregated "Today" summary for the Growth Hub (goals, gamification, learning, outreach)',
  })
  getSummary(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.growthHubService.getSummary(workspaceId, user.userId);
  }
}
