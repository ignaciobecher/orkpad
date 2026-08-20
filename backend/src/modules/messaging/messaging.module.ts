import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MessagingController } from './messaging.controller';
import { MessagingPublicController } from './messaging-public.controller';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { ConversationsRepository } from './conversations.repository';
import { MessagesRepository } from './messages.repository';
import { Conversation, ConversationSchema } from './conversations.schema';
import { Message, MessageSchema } from './messages.schema';
import { Project, ProjectSchema } from '../projects/projects.schema';
import { User, UserSchema } from '../users/users.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    NotificationsModule,
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [MessagingController, MessagingPublicController],
  providers: [
    MessagingService,
    MessagingGateway,
    ConversationsRepository,
    MessagesRepository,
  ],
  exports: [MessagingService, MessagingGateway],
})
export class MessagingModule {}
