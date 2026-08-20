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
import { LearningService } from './learning.service';
import { CreateLearningResourceDto } from './dto/create-learning-resource.dto';
import { UpdateLearningResourceDto } from './dto/update-learning-resource.dto';
import { QueryLearningResourceDto } from './dto/query-learning-resource.dto';
import { LogLearningProgressDto } from './dto/log-progress.dto';
import { CreateSkillFocusDto } from './dto/create-skill-focus.dto';
import { UpdateSkillFocusDto } from './dto/update-skill-focus.dto';

@ApiTags('Learning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get('resources')
  @ApiOperation({ summary: 'List learning resources (books, videos, courses)' })
  findAllResources(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Query() query: QueryLearningResourceDto,
  ) {
    return this.learningService.findAllResources(
      workspaceId,
      user.userId,
      query,
    );
  }

  @Get('resources/today')
  @ApiOperation({
    summary: "Get today's progress for resources with a daily minimum",
  })
  getTodayProgress(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.learningService.getTodayProgress(workspaceId, user.userId);
  }

  @Get('resources/:id')
  @ApiOperation({ summary: 'Get a single learning resource' })
  findOneResource(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.learningService.findOneResource(workspaceId, user.userId, id);
  }

  @Get('resources/:id/entries')
  @ApiOperation({ summary: 'Get daily progress log history for a resource' })
  getEntries(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    return this.learningService.getEntries(workspaceId, user.userId, id, query);
  }

  @Post('resources')
  @ApiOperation({ summary: 'Create a learning resource' })
  createResource(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateLearningResourceDto,
  ) {
    return this.learningService.createResource(workspaceId, user.userId, dto);
  }

  @Post('resources/:id/log-progress')
  @ApiOperation({ summary: "Log today's progress for a resource" })
  logProgress(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: LogLearningProgressDto,
  ) {
    return this.learningService.logProgress(workspaceId, user.userId, id, dto);
  }

  @Patch('resources/:id')
  @ApiOperation({ summary: 'Update a learning resource' })
  updateResource(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateLearningResourceDto,
  ) {
    return this.learningService.updateResource(
      workspaceId,
      user.userId,
      id,
      dto,
    );
  }

  @Delete('resources/:id')
  @ApiOperation({ summary: 'Soft-delete a learning resource' })
  removeResource(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.learningService.removeResource(workspaceId, user.userId, id);
  }

  @Get('skill-focus/current')
  @ApiOperation({ summary: "Get this week's active skill focus" })
  getCurrentFocus(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.learningService.getCurrentFocus(workspaceId, user.userId);
  }

  @Get('skill-focus/history')
  @ApiOperation({ summary: 'Get past weekly skill focuses' })
  getFocusHistory(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Query() query: { page?: number; limit?: number },
  ) {
    return this.learningService.getHistory(workspaceId, user.userId, query);
  }

  @Post('skill-focus')
  @ApiOperation({
    summary:
      "Define this week's skill focus (e.g. Kubernetes, IA, ciberseguridad)",
  })
  setWeeklyFocus(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateSkillFocusDto,
  ) {
    return this.learningService.setWeeklyFocus(workspaceId, user.userId, dto);
  }

  @Patch('skill-focus/:id')
  @ApiOperation({
    summary: 'Update a skill focus (e.g. mark as completed with outcome notes)',
  })
  updateFocus(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateSkillFocusDto,
  ) {
    return this.learningService.updateFocus(workspaceId, user.userId, id, dto);
  }
}
