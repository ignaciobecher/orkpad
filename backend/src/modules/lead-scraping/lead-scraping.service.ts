import { Injectable, Logger } from '@nestjs/common';
import { LeadSearchDocument } from '../lead-searches/lead-searches.schema';
import { LeadSearchesRepository } from '../lead-searches/lead-searches.repository';
import { LeadsRepository } from '../leads/leads.repository';
import {
  EmailFinderService,
  EmailFinderResult,
} from '../leads/email-finder.service';
import {
  GooglePlacesSource,
  PlaceResult,
} from './sources/google-places.source';
import { LeadScorerService } from './enrichment/lead-scorer.service';

const EMAIL_ENRICHMENT_BATCH_SIZE = 5;

@Injectable()
export class LeadScrapingService {
  private readonly logger = new Logger(LeadScrapingService.name);

  constructor(
    private readonly leadSearchesRepository: LeadSearchesRepository,
    private readonly leadsRepository: LeadsRepository,
    private readonly googlePlacesSource: GooglePlacesSource,
    private readonly leadScorerService: LeadScorerService,
    private readonly emailFinderService: EmailFinderService,
  ) {}

  async processSearch(search: LeadSearchDocument): Promise<void> {
    const searchId = (search as any)._id.toString();
    const workspaceId = search.workspaceId;

    await this.leadSearchesRepository.markRunning(searchId);
    this.logger.log(
      `Processing search ${searchId}: "${search.query}" in "${search.location}"`,
    );

    try {
      const places = await this.googlePlacesSource.searchBusinesses(
        search.query,
        search.location,
        search.maxResults,
      );

      const emailsByPlaceId = await this.enrichEmails(places);

      let imported = 0;

      for (const place of places) {
        const found = emailsByPlaceId.get(place.placeId);

        const scoring = this.leadScorerService.score({
          website: place.website,
          phone: place.phone,
          email: found?.email,
          googleRating: place.rating,
          googleReviewCount: place.reviewCount,
        });

        const existing = await this.leadsRepository.findOneBy(workspaceId, {
          googlePlaceId: place.placeId,
        });

        if (existing) continue;

        await this.leadsRepository.create(workspaceId, {
          name: place.name,
          phone: place.phone,
          website: place.website,
          email: found?.email,
          emailSource: found?.source,
          emailConfidence: found?.confidence,
          address: place.address,
          googlePlaceId: place.placeId,
          googleMapsUrl: place.googleMapsUrl,
          googleRating: place.rating,
          googleReviewCount: place.reviewCount,
          coordinates:
            place.lat && place.lng
              ? { lat: place.lat, lng: place.lng }
              : undefined,
          score: scoring.score,
          opportunities: scoring.opportunities,
          source: 'google_maps',
          searchId,
          status: 'new',
        });

        imported++;
      }

      await this.leadSearchesRepository.markCompleted(
        searchId,
        places.length,
        imported,
      );
      this.logger.log(
        `Search ${searchId} completed: ${places.length} found, ${imported} imported`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Search ${searchId} failed: ${message}`);
      await this.leadSearchesRepository.markFailed(searchId, message);
    }
  }

  private async enrichEmails(
    places: PlaceResult[],
  ): Promise<Map<string, EmailFinderResult>> {
    const result = new Map<string, EmailFinderResult>();
    const withWebsite = places.filter((place) => place.website);

    for (let i = 0; i < withWebsite.length; i += EMAIL_ENRICHMENT_BATCH_SIZE) {
      const batch = withWebsite.slice(i, i + EMAIL_ENRICHMENT_BATCH_SIZE);
      const settled = await Promise.allSettled(
        batch.map((place) => this.emailFinderService.findEmail(place.website!)),
      );

      settled.forEach((outcome, index) => {
        if (outcome.status === 'fulfilled' && outcome.value.email) {
          result.set(batch[index].placeId, outcome.value);
        }
      });
    }

    return result;
  }
}
