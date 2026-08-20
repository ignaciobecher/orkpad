import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
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
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { QueryGoalDto } from './dto/query-goal.dto';
import {
  IncrementProgressDto,
  SetProgressDto,
} from './dto/register-progress.dto';
import { QueryGoalEntriesDto } from './dto/query-goal-entries.dto';

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'List goals (habits, targets, checklist items)' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Query() query: QueryGoalDto,
  ) {
    return this.goalsService.findAll(workspaceId, user.userId, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get aggregated KPI summary across all goals' })
  getSummary(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.goalsService.getSummary(workspaceId, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single goal' })
  findOne(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.goalsService.findOne(workspaceId, user.userId, id);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get stats for a single goal (completion rate, streaks)',
  })
  getGoalStats(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.goalsService.getGoalStats(workspaceId, user.userId, id);
  }

  @Get(':id/entries/current')
  @ApiOperation({
    summary: 'Get (or lazily create) the entry for the current period',
  })
  getCurrentEntry(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.goalsService.getCurrentEntry(workspaceId, user.userId, id);
  }

  @Get(':id/entries')
  @ApiOperation({
    summary: 'Get paginated entry history for a goal (for heatmap/calendar)',
  })
  getEntries(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Query() query: QueryGoalEntriesDto,
  ) {
    return this.goalsService.getEntries(workspaceId, user.userId, id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a goal' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateGoalDto,
  ) {
    return this.goalsService.create(workspaceId, user.userId, dto);
  }

  @Post(':id/progress/increment')
  @ApiOperation({ summary: 'Increment progress for the current period' })
  incrementProgress(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: IncrementProgressDto,
  ) {
    return this.goalsService.incrementProgress(
      workspaceId,
      user.userId,
      id,
      dto,
    );
  }

  @Put(':id/progress')
  @ApiOperation({
    summary: 'Set progress to a manual value for the current period',
  })
  setProgress(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: SetProgressDto,
  ) {
    return this.goalsService.setProgress(workspaceId, user.userId, id, dto);
  }

  @Patch(':id/progress/complete')
  @ApiOperation({ summary: 'Mark the current period as completed' })
  completeCurrentEntry(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.goalsService.completeCurrentEntry(workspaceId, user.userId, id);
  }

  @Patch(':id/progress/uncomplete')
  @ApiOperation({ summary: 'Unmark the current period as completed' })
  uncompleteCurrentEntry(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.goalsService.uncompleteCurrentEntry(
      workspaceId,
      user.userId,
      id,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal' })
  update(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(workspaceId, user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a goal (cascades to its entries)' })
  remove(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.goalsService.remove(workspaceId, user.userId, id);
  }
}
