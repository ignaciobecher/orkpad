import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { TimeTrackingModule } from './modules/time-tracking/time-tracking.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { DocumentsModule } from './modules/docs/docs.module';
import { EventsModule } from './modules/agenda/agenda.module';
import { TaskColumnsModule } from './modules/task-columns/task-columns.module';
import { WorkSessionsModule } from './modules/work-sessions/work-sessions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PushSubscriptionsModule } from './modules/push-subscriptions/push-subscriptions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { GithubIntegrationModule } from './modules/github-integration/github-integration.module';
import { NotesModule } from './modules/notes/notes.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { SupportModule } from './modules/support/support.module';
import { PlannerBlocksModule } from './modules/planner-blocks/planner-blocks.module';
import { PlannerTasksModule } from './modules/planner-tasks/planner-tasks.module';
import { PlannerTemplatesModule } from './modules/planner-templates/planner-templates.module';
import { GoalsModule } from './modules/goals/goals.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        MONGODB_URI: Joi.string().required(),
        FRONTEND_URL: Joi.string().uri().required(),
        JWT_SECRET: Joi.string().min(16).required(),
        JWT_REFRESH_SECRET: Joi.string().min(16).required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        PROJECT_LINK_JWT_EXPIRES_IN: Joi.string().default('4h'),
        GITHUB_CLIENT_ID: Joi.string().allow('').optional(),
        GITHUB_CLIENT_SECRET: Joi.string().allow('').optional(),
        GITHUB_CALLBACK_URL: Joi.string().allow('').optional(),
        GITHUB_WEBHOOK_SECRET: Joi.string().allow('').optional(),
        RESEND_API_KEY: Joi.string().allow('').optional(),
        FROM_EMAIL: Joi.string().email().default('no-reply@orkpad.com'),
        API_URL: Joi.string().uri().default('http://localhost:3000'),
        VAPID_PUBLIC_KEY: Joi.string().allow('').optional(),
        VAPID_PRIVATE_KEY: Joi.string().allow('').optional(),
        VAPID_SUBJECT: Joi.string().allow('').optional(),
        ADMIN_USER_ID: Joi.string().allow('').optional(),
        ADMIN_EMAIL: Joi.string().email().allow('').optional(),
        ENCRYPTION_KEY: Joi.string().allow('').optional(),
        OPENAI_API_KEY: Joi.string().allow('').optional(),
        OPENAI_MODEL: Joi.string().allow('').optional(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    WorkspacesModule,
    ClientsModule,
    ProjectsModule,
    TasksModule,
    OnboardingModule,
    TaskColumnsModule,
    InvoicesModule,
    TimeTrackingModule,
    SubscriptionsModule,
    DocumentsModule,
    EventsModule,
    WorkSessionsModule,
    NotificationsModule,
    PushSubscriptionsModule,
    DashboardModule,
    QuotesModule,
    GithubIntegrationModule,
    NotesModule,
    PaymentMethodsModule,
    MessagingModule,
    SupportModule,
    PlannerBlocksModule,
    PlannerTasksModule,
    PlannerTemplatesModule,
    GoalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
