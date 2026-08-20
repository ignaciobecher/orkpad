import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlannerBlocksController } from './planner-blocks.controller';
import { PlannerBlocksService } from './planner-blocks.service';
import { PlannerBlocksRepository } from './planner-blocks.repository';
import { PlannerBlock, PlannerBlockSchema } from './planner-blocks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlannerBlock.name, schema: PlannerBlockSchema },
    ]),
  ],
  controllers: [PlannerBlocksController],
  providers: [PlannerBlocksService, PlannerBlocksRepository],
  exports: [PlannerBlocksService],
})
export class PlannerBlocksModule {}
