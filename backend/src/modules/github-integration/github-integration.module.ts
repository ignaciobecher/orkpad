import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { Task, TaskSchema } from '../tasks/tasks.schema';
import { GithubIntegrationController } from './github-integration.controller';
import { GithubIntegrationService } from './github-integration.service';
import { GithubWebhookService } from './github-webhook.service';

@Module({
  imports: [
    ConfigModule,
    ProjectsModule,
    forwardRef(() => TasksModule),
    UsersModule,
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [GithubIntegrationController],
  providers: [GithubIntegrationService, GithubWebhookService],
  exports: [GithubIntegrationService],
})
export class GithubIntegrationModule {}
