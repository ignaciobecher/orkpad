import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlannerTemplatesController } from './planner-templates.controller';
import { PlannerTemplatesService } from './planner-templates.service';
import { PlannerTemplatesRepository } from './planner-templates.repository';
import {
  PlannerTemplate,
  PlannerTemplateSchema,
} from './planner-templates.schema';
import { PlannerBlocksRepository } from '../planner-blocks/planner-blocks.repository';
import {
  PlannerBlock,
  PlannerBlockSchema,
} from '../planner-blocks/planner-blocks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlannerTemplate.name, schema: PlannerTemplateSchema },
      { name: PlannerBlock.name, schema: PlannerBlockSchema },
    ]),
  ],
  controllers: [PlannerTemplatesController],
  providers: [
    PlannerTemplatesService,
    PlannerTemplatesRepository,
    PlannerBlocksRepository,
  ],
  exports: [PlannerTemplatesService],
})
export class PlannerTemplatesModule {}
