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
import { TasksService } from './tasks.service';
import { GithubIntegrationService } from '../github-integration/github-integration.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly githubIntegrationService: GithubIntegrationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all tasks in the workspace' })
  findAll(@WorkspaceId() workspaceId: string, @Query() query: QueryTaskDto) {
    return this.tasksService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.tasksService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@WorkspaceId() workspaceId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(workspaceId, id, dto);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move a task to a different column' })
  move(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.move(workspaceId, id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({
    summary: 'Mark task as done and generate client report (WhatsApp + email)',
  })
  complete(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: CompleteTaskDto,
  ) {
    return this.tasksService.complete(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a task' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.tasksService.remove(workspaceId, id);
  }

  @Post(':id/create-branch')
  @ApiOperation({ summary: 'Create a GitHub branch for this task' })
  async createBranch(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    const task = await this.tasksService.findOne(workspaceId, id);
    if (!task.projectId) {
      return { error: 'Task has no project assigned' };
    }
    const { owner, repo, defaultBranch } =
      await this.githubIntegrationService.getFirstProjectRepo(
        workspaceId,
        task.projectId,
      );
    const slug = task.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    const branchName = `feature/TASK-${id.slice(-6)}-${slug}`;
    return this.githubIntegrationService.createBranch(
      owner,
      repo,
      defaultBranch,
      branchName,
      user.userId,
    );
  }
}
