import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlannerTasksController } from './planner-tasks.controller';
import { PlannerTasksService } from './planner-tasks.service';
import { PlannerTasksRepository } from './planner-tasks.repository';
import { PlannerTask, PlannerTaskSchema } from './planner-tasks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlannerTask.name, schema: PlannerTaskSchema },
    ]),
  ],
  controllers: [PlannerTasksController],
  providers: [PlannerTasksService, PlannerTasksRepository],
  exports: [PlannerTasksService],
})
export class PlannerTasksModule {}
