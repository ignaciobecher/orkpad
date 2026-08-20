import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { GamificationProfileRepository } from './gamification-profile.repository';
import { GamificationEventRepository } from './gamification-event.repository';
import {
  GamificationProfile,
  GamificationProfileSchema,
} from './gamification-profile.schema';
import {
  GamificationEvent,
  GamificationEventSchema,
} from './gamification-event.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GamificationProfile.name, schema: GamificationProfileSchema },
      { name: GamificationEvent.name, schema: GamificationEventSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [GamificationController],
  providers: [
    GamificationService,
    GamificationProfileRepository,
    GamificationEventRepository,
  ],
  exports: [GamificationService],
})
export class GamificationModule {}
