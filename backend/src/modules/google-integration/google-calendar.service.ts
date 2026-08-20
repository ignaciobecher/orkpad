import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleIntegrationService } from './google-integration.service';

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  htmlLink?: string;
  status?: string;
}

interface CalendarListResponse {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
}

@Injectable()
export class GoogleCalendarService {
  constructor(
    private readonly googleIntegrationService: GoogleIntegrationService,
  ) {}

  async listEvents(
    userId: string,
    options: { from?: Date; to?: Date; maxResults?: number } = {},
  ): Promise<GoogleCalendarEvent[]> {
    const accessToken =
      await this.googleIntegrationService.getValidAccessToken(userId);

    const now = options.from ?? new Date();
    const until = options.to ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const maxResults = options.maxResults ?? 50;

    const params = new URLSearchParams({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: until.toISOString(),
      maxResults: String(maxResults),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!res.ok) {
      throw new BadRequestException('Failed to fetch Google Calendar events');
    }

    const data = (await res.json()) as CalendarListResponse;
    return data.items ?? [];
  }

  async createEvent(
    userId: string,
    event: {
      summary: string;
      description?: string;
      location?: string;
      start: string;
      end: string;
    },
  ): Promise<GoogleCalendarEvent> {
    const accessToken =
      await this.googleIntegrationService.getValidAccessToken(userId);

    const body = {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: event.start },
      end: { dateTime: event.end },
    };

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      throw new BadRequestException('Failed to create Google Calendar event');
    }

    return res.json() as Promise<GoogleCalendarEvent>;
  }
}
