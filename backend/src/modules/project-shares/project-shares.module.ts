import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { ProjectShare, ProjectShareSchema } from './project-share.schema';
import { ProjectSharesRepository } from './project-shares.repository';
import { ProjectSharesService } from './project-shares.service';
import { ProjectSharesController } from './project-shares.controller';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forFeature([
      { name: ProjectShare.name, schema: ProjectShareSchema },
    ]),
  ],
  controllers: [ProjectSharesController],
  providers: [ProjectSharesService, ProjectSharesRepository],
  exports: [ProjectSharesService, ProjectSharesRepository],
})
export class ProjectSharesModule {}
