import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { LeadSearchesService } from './lead-searches.service';
import { CreateLeadSearchDto } from './dto/create-lead-search.dto';
import { QueryLeadSearchDto } from './dto/query-lead-search.dto';

@ApiTags('Lead Searches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lead-searches')
export class LeadSearchesController {
  constructor(private readonly leadSearchesService: LeadSearchesService) {}

  @Get()
  @ApiOperation({ summary: 'List lead searches in the workspace' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryLeadSearchDto,
  ) {
    return this.leadSearchesService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead search by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.leadSearchesService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create and queue a new lead search' })
  create(@WorkspaceId() workspaceId: string, @Body() dto: CreateLeadSearchDto) {
    return this.leadSearchesService.create(workspaceId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a lead search' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.leadSearchesService.remove(workspaceId, id);
  }
}
