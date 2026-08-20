import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PlaceResult {
  placeId: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
}

@Injectable()
export class GooglePlacesSource {
  private readonly logger = new Logger(GooglePlacesSource.name);
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY');
  }

  async searchBusinesses(
    query: string,
    location: string,
    maxResults: number,
  ): Promise<PlaceResult[]> {
    if (!this.apiKey) {
      this.logger.warn(
        'GOOGLE_PLACES_API_KEY not set — skipping Google Places search',
      );
      return [];
    }

    const results: PlaceResult[] = [];
    let nextPageToken: string | undefined;

    try {
      do {
        const body: Record<string, any> = {
          textQuery: `${query} en ${location}`,
          maxResultCount: Math.min(maxResults - results.length, 20),
          languageCode: 'es',
        };

        if (nextPageToken) {
          body.pageToken = nextPageToken;
        }

        const response = await fetch(
          'https://places.googleapis.com/v1/places:searchText',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': this.apiKey,
              'X-Goog-FieldMask':
                'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.location,places.googleMapsUri,nextPageToken',
            },
            body: JSON.stringify(body),
          },
        );

        if (!response.ok) {
          const error = await response.text();
          this.logger.error(`Google Places API error: ${error}`);
          break;
        }

        const data = await response.json();
        nextPageToken = data.nextPageToken;

        for (const place of data.places ?? []) {
          results.push({
            placeId: place.id,
            name: place.displayName?.text ?? '',
            address: place.formattedAddress,
            phone: place.nationalPhoneNumber,
            website: place.websiteUri,
            rating: place.rating,
            reviewCount: place.userRatingCount,
            lat: place.location?.latitude,
            lng: place.location?.longitude,
            googleMapsUrl: place.googleMapsUri,
          });
        }

        // Respect rate limits
        if (nextPageToken && results.length < maxResults) {
          await this.delay(500);
        }
      } while (nextPageToken && results.length < maxResults);
    } catch (err) {
      this.logger.error('Error fetching Google Places', err);
    }

    return results.slice(0, maxResults);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
