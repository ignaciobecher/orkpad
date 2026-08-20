import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeadSearchesRepository } from '../lead-searches/lead-searches.repository';
import { LeadScrapingService } from './lead-scraping.service';

@Injectable()
export class LeadScrapingWorker {
  private readonly logger = new Logger(LeadScrapingWorker.name);

  constructor(
    private readonly leadSearchesRepository: LeadSearchesRepository,
    private readonly leadScrapingService: LeadScrapingService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async processNextJobs(): Promise<void> {
    const pendingSearches = await this.leadSearchesRepository.findPending();

    for (const search of pendingSearches) {
      const running =
        await this.leadSearchesRepository.countRunningForWorkspace(
          search.workspaceId,
        );

      if (running > 0) {
        this.logger.debug(
          `Workspace ${search.workspaceId} already has a running search — skipping`,
        );
        continue;
      }

      // Fire and forget — errors are caught inside processSearch
      this.leadScrapingService.processSearch(search).catch((err) => {
        this.logger.error(`Unhandled error in processSearch: ${err}`);
      });
    }
  }
}
