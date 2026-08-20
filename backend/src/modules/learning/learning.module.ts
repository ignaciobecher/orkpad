import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { LearningResourceRepository } from './learning-resource.repository';
import { LearningEntryRepository } from './learning-entry.repository';
import { SkillFocusRepository } from './skill-focus.repository';
import {
  LearningResource,
  LearningResourceSchema,
} from './learning-resource.schema';
import { LearningEntry, LearningEntrySchema } from './learning-entry.schema';
import { SkillFocus, SkillFocusSchema } from './skill-focus.schema';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LearningResource.name, schema: LearningResourceSchema },
      { name: LearningEntry.name, schema: LearningEntrySchema },
      { name: SkillFocus.name, schema: SkillFocusSchema },
    ]),
    GamificationModule,
  ],
  controllers: [LearningController],
  providers: [
    LearningService,
    LearningResourceRepository,
    LearningEntryRepository,
    SkillFocusRepository,
  ],
  exports: [LearningService],
})
export class LearningModule {}
