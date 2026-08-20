import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OutreachController } from './outreach.controller';
import { OutreachService } from './outreach.service';
import { OutreachActivityRepository } from './outreach-activity.repository';
import { OutreachWeeklyGoalRepository } from './outreach-weekly-goal.repository';
import {
  OutreachActivity,
  OutreachActivitySchema,
} from './outreach-activity.schema';
import {
  OutreachWeeklyGoal,
  OutreachWeeklyGoalSchema,
} from './outreach-weekly-goal.schema';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OutreachActivity.name, schema: OutreachActivitySchema },
      { name: OutreachWeeklyGoal.name, schema: OutreachWeeklyGoalSchema },
    ]),
    GamificationModule,
  ],
  controllers: [OutreachController],
  providers: [
    OutreachService,
    OutreachActivityRepository,
    OutreachWeeklyGoalRepository,
  ],
  exports: [OutreachService],
})
export class OutreachModule {}
