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
import { TimeTrackingService } from './time-tracking.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { QueryTimeEntryDto } from './dto/query-time-entry.dto';

@ApiTags('Time Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('time-entries')
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  @Get()
  @ApiOperation({ summary: 'List all time entries in the workspace' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryTimeEntryDto,
  ) {
    return this.timeTrackingService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a time entry by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.timeTrackingService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new time entry' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateTimeEntryDto,
  ) {
    return this.timeTrackingService.create(workspaceId, user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a time entry' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    return this.timeTrackingService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a time entry' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.timeTrackingService.remove(workspaceId, id);
  }
}
