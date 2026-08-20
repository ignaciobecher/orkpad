import { Module } from '@nestjs/common';
import { GrowthHubController } from './growth-hub.controller';
import { GrowthHubService } from './growth-hub.service';
import { GoalsModule } from '../goals/goals.module';
import { GamificationModule } from '../gamification/gamification.module';
import { LearningModule } from '../learning/learning.module';
import { OutreachModule } from '../outreach/outreach.module';

@Module({
  imports: [GoalsModule, GamificationModule, LearningModule, OutreachModule],
  controllers: [GrowthHubController],
  providers: [GrowthHubService],
})
export class GrowthHubModule {}
