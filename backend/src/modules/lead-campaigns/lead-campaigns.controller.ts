import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { LeadCampaignsService } from './lead-campaigns.service';
import { CreateLeadCampaignDto } from './dto/create-lead-campaign.dto';
import { UpdateLeadCampaignDto } from './dto/update-lead-campaign.dto';

@ApiTags('Lead Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lead-campaigns')
export class LeadCampaignsController {
  constructor(private readonly leadCampaignsService: LeadCampaignsService) {}

  @Get()
  @ApiOperation({ summary: 'List all campaigns in the workspace' })
  findAll(@WorkspaceId() workspaceId: string) {
    return this.leadCampaignsService.findAll(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.leadCampaignsService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  create(
    @WorkspaceId() workspaceId: string,
    @Body() dto: CreateLeadCampaignDto,
  ) {
    return this.leadCampaignsService.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a campaign' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeadCampaignDto,
  ) {
    return this.leadCampaignsService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a campaign' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.leadCampaignsService.remove(workspaceId, id);
  }

  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send campaign emails to eligible leads via Resend',
  })
  sendCampaign(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.leadCampaignsService.sendCampaign(workspaceId, id);
  }
}
