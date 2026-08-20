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
import { PlannerTemplatesService } from './planner-templates.service';
import { CreatePlannerTemplateDto } from './dto/create-planner-template.dto';
import { UpdatePlannerTemplateDto } from './dto/update-planner-template.dto';
import { QueryPlannerTemplateDto } from './dto/query-planner-template.dto';
import { CaptureDayTemplateDto } from './dto/capture-day-template.dto';

@ApiTags('Planner Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('planner-templates')
export class PlannerTemplatesController {
  constructor(
    private readonly plannerTemplatesService: PlannerTemplatesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List templates (own + optionally public)' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Query() query: QueryPlannerTemplateDto,
  ) {
    return this.plannerTemplatesService.findAll(
      workspaceId,
      user.userId,
      query,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single template' })
  findOne(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.plannerTemplatesService.findOne(workspaceId, user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a template' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreatePlannerTemplateDto,
  ) {
    return this.plannerTemplatesService.create(workspaceId, user.userId, dto);
  }

  @Post('from-day')
  @ApiOperation({ summary: "Capture a day's blocks as a new template" })
  captureFromDay(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CaptureDayTemplateDto,
  ) {
    return this.plannerTemplatesService.captureFromDay(
      workspaceId,
      user.userId,
      dto,
    );
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a template' })
  duplicate(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.plannerTemplatesService.duplicate(workspaceId, user.userId, id);
  }

  @Post(':id/apply')
  @ApiOperation({ summary: 'Apply template to a target date, creating blocks' })
  @ApiQuery({ name: 'targetDate', required: true, example: '2026-05-27' })
  applyToDate(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Query('targetDate') targetDate: string,
  ) {
    return this.plannerTemplatesService.applyToDate(
      workspaceId,
      user.userId,
      id,
      targetDate,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a template' })
  update(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdatePlannerTemplateDto,
  ) {
    return this.plannerTemplatesService.update(
      workspaceId,
      user.userId,
      id,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a template' })
  remove(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.plannerTemplatesService.remove(workspaceId, user.userId, id);
  }
}
