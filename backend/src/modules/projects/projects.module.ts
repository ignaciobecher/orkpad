import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule } from '../clients/clients.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectsRepository } from './projects.repository';
import { AiModule } from '../ai/ai.module';
import { Project, ProjectSchema } from './projects.schema';
import { Task, TaskSchema } from '../tasks/tasks.schema';
import { Invoice, InvoiceSchema } from '../invoices/invoices.schema';
import {
  TimeEntry,
  TimeEntrySchema,
} from '../time-tracking/time-tracking.schema';
import { Document, DocumentSchema } from '../docs/docs.schema';

@Module({
  imports: [
    JwtModule.register({}),
    ClientsModule,
    NotificationsModule,
    UsersModule,
    forwardRef(() => InvoicesModule),
    AiModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: TimeEntry.name, schema: TimeEntrySchema },
      { name: Document.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    ProjectsRepository,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
