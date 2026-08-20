import { PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateLeadCampaignDto } from './create-lead-campaign.dto';

export class UpdateLeadCampaignDto extends PartialType(CreateLeadCampaignDto) {
  @ApiPropertyOptional({ enum: ['draft', 'active', 'paused', 'completed'] })
  @IsIn(['draft', 'active', 'paused', 'completed'])
  @IsOptional()
  status?: 'draft' | 'active' | 'paused' | 'completed';
}
