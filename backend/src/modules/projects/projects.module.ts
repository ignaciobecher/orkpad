import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule } from '../clients/clients.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { ProjectsController } from './projects.controller';
import { ProjectsPublicController } from './projects-public.controller';
import { ProjectsService } from './projects.service';
import { ProjectsRepository } from './projects.repository';
import { ProjectLinkCredentialService } from './project-link-credential.service';
import { ProjectLinkCredentialRepository } from './project-link-credential.repository';
import { Project, ProjectSchema } from './projects.schema';
import {
  ProjectLinkCredential,
  ProjectLinkCredentialSchema,
} from './project-link-credential.schema';
import { Task, TaskSchema } from '../tasks/tasks.schema';
import { Invoice, InvoiceSchema } from '../invoices/invoices.schema';
import { Document, DocumentSchema } from '../docs/docs.schema';

@Module({
  imports: [
    JwtModule.register({}),
    ClientsModule,
    NotificationsModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectLinkCredential.name, schema: ProjectLinkCredentialSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Document.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [ProjectsController, ProjectsPublicController],
  providers: [
    ProjectsService,
    ProjectsRepository,
    ProjectLinkCredentialService,
    ProjectLinkCredentialRepository,
  ],
  exports: [ProjectsService, ProjectLinkCredentialService],
})
export class ProjectsModule {}
