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
import { PlannerTasksService } from './planner-tasks.service';
import { CreatePlannerTaskDto } from './dto/create-planner-task.dto';
import { UpdatePlannerTaskDto } from './dto/update-planner-task.dto';
import { QueryPlannerTaskDto } from './dto/query-planner-task.dto';
import { ReorderPlannerTasksDto } from './dto/reorder-planner-tasks.dto';

@ApiTags('Planner Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('planner-tasks')
export class PlannerTasksController {
  constructor(private readonly plannerTasksService: PlannerTasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks (by blockId, status)' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Query() query: QueryPlannerTaskDto,
  ) {
    return this.plannerTasksService.findAll(workspaceId, user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task' })
  findOne(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.plannerTasksService.findOne(workspaceId, user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a task inside a block' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreatePlannerTaskDto,
  ) {
    return this.plannerTasksService.create(workspaceId, user.userId, dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder tasks within a block' })
  reorder(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: ReorderPlannerTasksDto,
  ) {
    return this.plannerTasksService.reorder(workspaceId, user.userId, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle task completed state' })
  toggle(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.plannerTasksService.toggle(workspaceId, user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdatePlannerTaskDto,
  ) {
    return this.plannerTasksService.update(workspaceId, user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a task' })
  remove(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.plannerTasksService.remove(workspaceId, user.userId, id);
  }
}
