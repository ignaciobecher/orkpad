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
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List leads in the workspace' })
  findAll(@WorkspaceId() workspaceId: string, @Query() query: QueryLeadDto) {
    return this.leadsService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.leadsService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a lead manually' })
  create(@WorkspaceId() workspaceId: string, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a lead' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.leadsService.remove(workspaceId, id);
  }

  @Post(':id/harvest-email')
  @ApiOperation({
    summary: "Try to find the lead's email by scraping its website",
  })
  harvestEmail(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.leadsService.harvestEmail(workspaceId, id);
  }
}
