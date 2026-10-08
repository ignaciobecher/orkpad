import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { TaskColumnsModule } from '../task-columns/task-columns.module';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../clients/clients.module';
import { MailModule } from '../mail/mail.module';
import { GithubIntegrationModule } from '../github-integration/github-integration.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { Task, TaskSchema } from './tasks.schema';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    ProjectsModule,
    TaskColumnsModule,
    UsersModule,
    ClientsModule,
    MailModule,
    AiModule,
    forwardRef(() => GithubIntegrationModule),
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
  exports: [TasksService],
})
export class TasksModule {}
