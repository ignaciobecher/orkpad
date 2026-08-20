import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
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
import { DealsModule } from './modules/pipeline/pipeline.module';
import { ProductsModule } from './modules/products/products.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { InfrastructureResourcesModule } from './modules/infrastructure/infrastructure.module';
import { DocumentsModule } from './modules/docs/docs.module';
import { EventsModule } from './modules/agenda/agenda.module';
import { TaskColumnsModule } from './modules/task-columns/task-columns.module';
import { WorkSessionsModule } from './modules/work-sessions/work-sessions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PushSubscriptionsModule } from './modules/push-subscriptions/push-subscriptions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { GithubIntegrationModule } from './modules/github-integration/github-integration.module';
import { RailwayIntegrationModule } from './modules/railway-integration/railway-integration.module';
import { NetlifyIntegrationModule } from './modules/netlify-integration/netlify-integration.module';
import { NotesModule } from './modules/notes/notes.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { SupportModule } from './modules/support/support.module';
import { LeadsModule } from './modules/leads/leads.module';
import { LeadSearchesModule } from './modules/lead-searches/lead-searches.module';
import { LeadCampaignsModule } from './modules/lead-campaigns/lead-campaigns.module';
import { LeadScrapingModule } from './modules/lead-scraping/lead-scraping.module';
import { GoogleIntegrationModule } from './modules/google-integration/google-integration.module';
import { SupabaseIntegrationModule } from './modules/supabase-integration/supabase-integration.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { PlannerBlocksModule } from './modules/planner-blocks/planner-blocks.module';
import { PlannerTasksModule } from './modules/planner-tasks/planner-tasks.module';
import { PlannerTemplatesModule } from './modules/planner-templates/planner-templates.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { SocialIdentityModule } from './modules/social-identity/social-identity.module';
import { GoalsModule } from './modules/goals/goals.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { LearningModule } from './modules/learning/learning.module';
import { OutreachModule } from './modules/outreach/outreach.module';
import { GrowthHubModule } from './modules/growth-hub/growth-hub.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    DealsModule,
    ProductsModule,
    SubscriptionsModule,
    InfrastructureResourcesModule,
    DocumentsModule,
    EventsModule,
    WorkSessionsModule,
    NotificationsModule,
    PushSubscriptionsModule,
    DashboardModule,
    QuotesModule,
    GithubIntegrationModule,
    RailwayIntegrationModule,
    NetlifyIntegrationModule,
    NotesModule,
    MessagingModule,
    SupportModule,
    LeadsModule,
    LeadSearchesModule,
    LeadCampaignsModule,
    LeadScrapingModule,
    GoogleIntegrationModule,
    SupabaseIntegrationModule,
    TestimonialsModule,
    PortfolioModule,
    ResourcesModule,
    PlannerBlocksModule,
    PlannerTasksModule,
    PlannerTemplatesModule,
    MarketingModule,
    SocialIdentityModule,
    GoalsModule,
    GamificationModule,
    LearningModule,
    OutreachModule,
    GrowthHubModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
