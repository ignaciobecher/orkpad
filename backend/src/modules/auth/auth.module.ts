import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Client, ClientSchema } from '../clients/clients.schema';
import { Project, ProjectSchema } from '../projects/projects.schema';
import { Task, TaskSchema } from '../tasks/tasks.schema';
import { Invoice, InvoiceSchema } from '../invoices/invoices.schema';
import { Event, EventSchema } from '../agenda/agenda.schema';
import { Deal, DealSchema } from '../pipeline/pipeline.schema';
import { Product, ProductSchema } from '../products/products.schema';
import {
  Subscription,
  SubscriptionSchema,
} from '../subscriptions/subscriptions.schema';
import { Document as Doc, DocumentSchema } from '../docs/docs.schema';
import {
  TaskColumn,
  TaskColumnSchema,
} from '../task-columns/task-columns.schema';
import {
  TimeEntry,
  TimeEntrySchema,
} from '../time-tracking/time-tracking.schema';
import {
  WorkSession,
  WorkSessionSchema,
} from '../work-sessions/work-sessions.schema';
import { Quote, QuoteSchema } from '../quotes/quotes.schema';
import {
  PushSubscription,
  PushSubscriptionSchema,
} from '../push-subscriptions/push-subscriptions.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GithubStrategy } from './strategies/github.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    UsersModule,
    WorkspacesModule,
    MailModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Event.name, schema: EventSchema },
      { name: Deal.name, schema: DealSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Doc.name, schema: DocumentSchema },
      { name: TaskColumn.name, schema: TaskColumnSchema },
      { name: TimeEntry.name, schema: TimeEntrySchema },
      { name: WorkSession.name, schema: WorkSessionSchema },
      { name: Quote.name, schema: QuoteSchema },
      { name: PushSubscription.name, schema: PushSubscriptionSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GithubStrategy],
})
export class AuthModule {}
