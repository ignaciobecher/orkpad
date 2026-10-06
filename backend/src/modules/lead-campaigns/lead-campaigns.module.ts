import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadCampaignsController } from './lead-campaigns.controller';
import { LeadCampaignsService } from './lead-campaigns.service';
import { LeadCampaignsRepository } from './lead-campaigns.repository';
import { LeadCampaign, LeadCampaignSchema } from './lead-campaigns.schema';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeadCampaign.name, schema: LeadCampaignSchema },
    ]),
    LeadsModule,
  ],
  controllers: [LeadCampaignsController],
  providers: [LeadCampaignsService, LeadCampaignsRepository],
  exports: [LeadCampaignsService],
})
export class LeadCampaignsModule {}
