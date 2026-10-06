import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { QuotesModule } from '../quotes/quotes.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';

@Module({
  imports: [ClientsModule, ProjectsModule, TasksModule, QuotesModule, SubscriptionsModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
