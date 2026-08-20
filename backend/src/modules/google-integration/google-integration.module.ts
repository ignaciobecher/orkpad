import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { GoogleIntegrationController } from './google-integration.controller';
import { GoogleIntegrationService } from './google-integration.service';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleGmailService } from './google-gmail.service';

@Module({
  imports: [UsersModule],
  controllers: [GoogleIntegrationController],
  providers: [
    GoogleIntegrationService,
    GoogleCalendarService,
    GoogleGmailService,
  ],
  exports: [GoogleIntegrationService, GoogleGmailService],
})
export class GoogleIntegrationModule {}
