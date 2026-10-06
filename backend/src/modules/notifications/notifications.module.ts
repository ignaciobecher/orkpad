import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PushSubscriptionsModule } from '../push-subscriptions/push-subscriptions.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsController } from './notifications.controller';
import { AdminNotificationsController } from './admin-notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsCronService } from './notifications-cron.service';
import { NotificationsRepository } from './notifications.repository';
import { Notification, NotificationSchema } from './notifications.schema';
import { Project, ProjectSchema } from '../projects/projects.schema';
import { Task, TaskSchema } from '../tasks/tasks.schema';
import {
  Subscription,
  SubscriptionSchema,
} from '../subscriptions/subscriptions.schema';
import { Workspace, WorkspaceSchema } from '../workspaces/workspaces.schema';
import { Invoice, InvoiceSchema } from '../invoices/invoices.schema';
import {
  WorkSession,
  WorkSessionSchema,
} from '../work-sessions/work-sessions.schema';

@Module({
  imports: [
    PushSubscriptionsModule,
    UsersModule,
    MailModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: WorkSession.name, schema: WorkSessionSchema },
    ]),
  ],
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationsCronService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
