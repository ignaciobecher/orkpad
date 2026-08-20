import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { TaskColumnsController } from './task-columns.controller';
import { TaskColumnsService } from './task-columns.service';
import { TaskColumnsRepository } from './task-columns.repository';
import { TaskColumn, TaskColumnSchema } from './task-columns.schema';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forFeature([
      { name: TaskColumn.name, schema: TaskColumnSchema },
    ]),
  ],
  controllers: [TaskColumnsController],
  providers: [TaskColumnsService, TaskColumnsRepository],
  exports: [TaskColumnsService],
})
export class TaskColumnsModule {}
