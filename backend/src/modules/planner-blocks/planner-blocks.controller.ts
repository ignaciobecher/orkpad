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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PlannerBlocksService } from './planner-blocks.service';
import { CreatePlannerBlockDto } from './dto/create-planner-block.dto';
import { UpdatePlannerBlockDto } from './dto/update-planner-block.dto';
import { QueryPlannerBlockDto } from './dto/query-planner-block.dto';
import { ReorderPlannerBlocksDto } from './dto/reorder-planner-blocks.dto';
import { CloneWeekDto } from './dto/clone-week.dto';
import { UpdateBlockStatusDto } from './dto/update-block-status.dto';

@ApiTags('Planner Blocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('planner-blocks')
export class PlannerBlocksController {
  constructor(private readonly plannerBlocksService: PlannerBlocksService) {}

  @Get()
  @ApiOperation({
    summary: 'List blocks (by date, date range, status, category)',
  })
  findAll(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Query() query: QueryPlannerBlockDto,
  ) {
    return this.plannerBlocksService.findAll(workspaceId, user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single block' })
  findOne(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.plannerBlocksService.findOne(workspaceId, user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new planner block' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreatePlannerBlockDto,
  ) {
    return this.plannerBlocksService.create(workspaceId, user.userId, dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder blocks for a given date (drag & drop)' })
  reorder(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: ReorderPlannerBlocksDto,
  ) {
    return this.plannerBlocksService.reorder(workspaceId, user.userId, dto);
  }

  @Post('clone-week')
  @ApiOperation({ summary: 'Clone all blocks from one week to another' })
  cloneWeek(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CloneWeekDto,
  ) {
    return this.plannerBlocksService.cloneWeek(workspaceId, user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a block' })
  update(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdatePlannerBlockDto,
  ) {
    return this.plannerBlocksService.update(workspaceId, user.userId, id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update block status only' })
  updateStatus(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateBlockStatusDto,
  ) {
    return this.plannerBlocksService.updateStatus(
      workspaceId,
      user.userId,
      id,
      dto,
    );
  }

  @Post(':id/duplicate')
  @ApiOperation({
    summary: 'Duplicate a block (optionally to a different date)',
  })
  @ApiQuery({ name: 'targetDate', required: false, example: '2026-05-28' })
  duplicate(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Query('targetDate') targetDate?: string,
  ) {
    return this.plannerBlocksService.duplicate(
      workspaceId,
      user.userId,
      id,
      targetDate,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a block' })
  remove(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.plannerBlocksService.remove(workspaceId, user.userId, id);
  }
}
