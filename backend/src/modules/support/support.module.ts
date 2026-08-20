import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { SupportController } from './support.controller';
import { SupportAdminController } from './support-admin.controller';
import { SupportService } from './support.service';
import { SupportGateway } from './support.gateway';
import { SupportConversationsRepository } from './support-conversations.repository';
import { SupportMessagesRepository } from './support-messages.repository';
import {
  SupportConversation,
  SupportConversationSchema,
} from './support-conversations.schema';
import {
  SupportMessage,
  SupportMessageSchema,
} from './support-messages.schema';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    UsersModule,
    MailModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: SupportConversation.name, schema: SupportConversationSchema },
      { name: SupportMessage.name, schema: SupportMessageSchema },
    ]),
  ],
  controllers: [SupportController, SupportAdminController],
  providers: [
    SupportService,
    SupportGateway,
    SupportConversationsRepository,
    SupportMessagesRepository,
  ],
  exports: [SupportService, SupportGateway],
})
export class SupportModule {}
