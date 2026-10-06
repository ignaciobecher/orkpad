import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { GoalsRepository } from './goals.repository';
import { GoalEntriesRepository } from './goal-entries.repository';
import { Goal, GoalSchema } from './goals.schema';
import { GoalEntry, GoalEntrySchema } from './goal-entries.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Goal.name, schema: GoalSchema },
      { name: GoalEntry.name, schema: GoalEntrySchema },
    ]),
  ],
  controllers: [GoalsController],
  providers: [GoalsService, GoalsRepository, GoalEntriesRepository],
  exports: [GoalsService],
})
export class GoalsModule {}
