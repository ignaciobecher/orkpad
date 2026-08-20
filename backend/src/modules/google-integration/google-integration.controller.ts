import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GoogleIntegrationService } from './google-integration.service';
import {
  GoogleCalendarService,
  GoogleCalendarEvent,
} from './google-calendar.service';

@ApiTags('Google Integration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('google-integration')
export class GoogleIntegrationController {
  constructor(
    private readonly googleIntegrationService: GoogleIntegrationService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Get Google connection status for current user' })
  getStatus(@CurrentUser() user: { userId: string }) {
    return this.googleIntegrationService.getConnectionStatus(user.userId);
  }

  @Delete('disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disconnect Google account and remove stored tokens',
  })
  async disconnect(@CurrentUser() user: { userId: string }) {
    await this.googleIntegrationService.disconnect(user.userId);
    return { success: true };
  }

  @Get('calendar/events')
  @ApiOperation({
    summary: 'List upcoming Google Calendar events (next 30 days)',
  })
  getCalendarEvents(
    @CurrentUser() user: { userId: string },
    @Query('maxResults') maxResults?: string,
  ): Promise<GoogleCalendarEvent[]> {
    return this.googleCalendarService.listEvents(user.userId, {
      maxResults: maxResults ? parseInt(maxResults, 10) : 50,
    });
  }

  @Post('calendar/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync Google Calendar events — returns event count',
  })
  async syncCalendar(
    @CurrentUser() user: { userId: string },
  ): Promise<{ synced: number; events: GoogleCalendarEvent[] }> {
    const events = await this.googleCalendarService.listEvents(user.userId, {
      maxResults: 100,
    });
    return { synced: events.length, events };
  }
}
