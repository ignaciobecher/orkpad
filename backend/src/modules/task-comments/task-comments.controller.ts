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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TaskCommentsService } from './task-comments.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';
import { TaskActivitiesService } from '../task-activities/task-activities.service';

@ApiTags('TaskComments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/comments')
export class TaskCommentsController {
  constructor(
    private readonly commentsService: TaskCommentsService,
    private readonly activitiesService: TaskActivitiesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List comments of a task' })
  findByTask(
    @WorkspaceId() workspaceId: string,
    @Param('taskId') taskId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.commentsService.findByTask(workspaceId, taskId, page, limit);
  }

  @Post()
  @ApiOperation({ summary: 'Add a comment to a task' })
  create(
    @WorkspaceId() workspaceId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateTaskCommentDto,
  ) {
    return this.commentsService.create(workspaceId, taskId, user.userId, dto);
  }

  @Patch(':commentId')
  @ApiOperation({ summary: 'Edit own comment' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateTaskCommentDto,
  ) {
    return this.commentsService.update(
      workspaceId,
      taskId,
      commentId,
      user.userId,
      dto,
    );
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.commentsService.remove(workspaceId, taskId, commentId);
  }
}

@ApiTags('TaskActivities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/activities')
export class TaskActivitiesController {
  constructor(private readonly activitiesService: TaskActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List activity/history of a task' })
  findByTask(
    @WorkspaceId() workspaceId: string,
    @Param('taskId') taskId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.activitiesService.findByTask(workspaceId, taskId, page, limit);
  }
}
