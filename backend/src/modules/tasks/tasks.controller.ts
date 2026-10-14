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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
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

const MULTER_TASK_LIMIT = 100 * 1024 * 1024;

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
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(workspaceId, dto, {
      userId: user?.userId,
      name: user?.name,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(workspaceId, id, dto, {
      userId: user?.userId,
      name: user?.name,
    });
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move a task to a different column' })
  move(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.move(workspaceId, id, dto, {
      userId: user?.userId,
      name: user?.name,
    });
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a task' })
  duplicate(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.duplicate(workspaceId, id, {
      userId: user?.userId,
      name: user?.name,
    });
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Upload and attach a file to a task' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MULTER_TASK_LIMIT } }),
  )
  addAttachment(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Falta el archivo (campo file)');
    return this.tasksService.addAttachment(
      workspaceId,
      id,
      {
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      },
      { userId: user?.userId, name: user?.name },
    );
  }

  @Delete(':id/attachments/:fileId')
  @ApiOperation({ summary: 'Remove an attachment from a task' })
  removeAttachment(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.removeAttachment(workspaceId, id, fileId, {
      userId: user?.userId,
      name: user?.name,
    });
  }

  @Post(':id/complete')
  @ApiOperation({
    summary: 'Mark task as done and generate client report (WhatsApp + email)',
  })
  complete(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CompleteTaskDto,
  ) {
    return this.tasksService.complete(workspaceId, id, dto, {
      userId: user?.userId,
      name: user?.name,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a task' })
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.remove(workspaceId, id, {
      userId: user?.userId,
      name: user?.name,
    });
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
