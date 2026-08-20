import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GamificationService } from './gamification.service';
import { QueryGamificationEventsDto } from './dto/query-gamification-events.dto';

@ApiTags('Gamification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('profile')
  @ApiOperation({
    summary:
      'Get the current user gamification profile (points, level, streak, badges)',
  })
  getProfile(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.gamificationService.getProfile(workspaceId, user.userId);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get paginated points ledger history' })
  getEvents(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Query() query: QueryGamificationEventsDto,
  ) {
    return this.gamificationService.getEvents(workspaceId, user.userId, query);
  }
}
