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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { TaskColumnsService } from './task-columns.service';
import { CreateTaskColumnDto } from './dto/create-task-column.dto';
import { UpdateTaskColumnDto } from './dto/update-task-column.dto';

@ApiTags('Task Columns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('task-columns')
export class TaskColumnsController {
  constructor(private readonly service: TaskColumnsService) {}

  @Get()
  @ApiOperation({ summary: 'List columns for a project (ordered)' })
  @ApiQuery({ name: 'projectId', required: true })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query('projectId') projectId: string,
  ) {
    if (!projectId) throw new BadRequestException('projectId is required');
    return this.service.findAll(workspaceId, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a column by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.service.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new column for a project' })
  create(@WorkspaceId() workspaceId: string, @Body() dto: CreateTaskColumnDto) {
    return this.service.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a column' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskColumnDto,
  ) {
    return this.service.update(workspaceId, id, dto);
  }

  @Patch('reorder/bulk')
  @ApiOperation({ summary: 'Reorder multiple columns' })
  reorder(@WorkspaceId() workspaceId: string, @Body() dto: { ids: string[] }) {
    return this.service.reorder(workspaceId, dto.ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a column' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.service.remove(workspaceId, id);
  }
}
