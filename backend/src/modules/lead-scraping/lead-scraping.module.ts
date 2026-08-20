import { Module } from '@nestjs/common';
import { LeadScrapingService } from './lead-scraping.service';
import { LeadScrapingWorker } from './lead-scraping.worker';
import { GooglePlacesSource } from './sources/google-places.source';
import { LeadScorerService } from './enrichment/lead-scorer.service';
import { LeadSearchesModule } from '../lead-searches/lead-searches.module';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [LeadSearchesModule, LeadsModule],
  providers: [
    LeadScrapingService,
    LeadScrapingWorker,
    GooglePlacesSource,
    LeadScorerService,
  ],
})
export class LeadScrapingModule {}
