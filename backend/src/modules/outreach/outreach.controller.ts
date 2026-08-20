import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OutreachService } from './outreach.service';
import { CreateOutreachActivityDto } from './dto/create-outreach-activity.dto';
import { UpdateOutreachActivityDto } from './dto/update-outreach-activity.dto';
import { QueryOutreachActivityDto } from './dto/query-outreach-activity.dto';
import { SetWeeklyTargetDto } from './dto/set-weekly-target.dto';

@ApiTags('Outreach')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('outreach')
export class OutreachController {
  constructor(private readonly outreachService: OutreachService) {}

  @Get('activities')
  @ApiOperation({
    summary: 'List prospecting activities (cold emails, proposals, calls)',
  })
  findAllActivities(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Query() query: QueryOutreachActivityDto,
  ) {
    return this.outreachService.findAllActivities(
      workspaceId,
      user.userId,
      query,
    );
  }

  @Post('activities')
  @ApiOperation({ summary: 'Log a prospecting activity' })
  logActivity(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateOutreachActivityDto,
  ) {
    return this.outreachService.logActivity(workspaceId, user.userId, dto);
  }

  @Patch('activities/:id')
  @ApiOperation({ summary: 'Update a prospecting activity (e.g. set outcome)' })
  updateActivity(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateOutreachActivityDto,
  ) {
    return this.outreachService.updateActivity(
      workspaceId,
      user.userId,
      id,
      dto,
    );
  }

  @Delete('activities/:id')
  @ApiOperation({ summary: 'Soft-delete a prospecting activity' })
  removeActivity(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.outreachService.removeActivity(workspaceId, user.userId, id);
  }

  @Get('weekly-goal/current')
  @ApiOperation({ summary: "Get (or lazily create) this week's outreach goal" })
  getCurrentWeek(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.outreachService.getCurrentWeek(workspaceId, user.userId);
  }

  @Post('weekly-goal')
  @ApiOperation({ summary: "Set this week's outreach target count" })
  setWeeklyTarget(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: SetWeeklyTargetDto,
  ) {
    return this.outreachService.setWeeklyTarget(workspaceId, user.userId, dto);
  }

  @Get('weekly-goal/history')
  @ApiOperation({ summary: 'Get past weekly outreach goals' })
  getHistory(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Query() query: { page?: number; limit?: number },
  ) {
    return this.outreachService.getHistory(workspaceId, user.userId, query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get response/conversion rate stats for prospecting activities',
  })
  getStats(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.outreachService.getStats(workspaceId, user.userId);
  }
}
