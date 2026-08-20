import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Client, ClientSchema } from '../clients/clients.schema';
import { Project, ProjectSchema } from '../projects/projects.schema';
import { Task, TaskSchema } from '../tasks/tasks.schema';
import { Invoice, InvoiceSchema } from '../invoices/invoices.schema';
import {
  TimeEntry,
  TimeEntrySchema,
} from '../time-tracking/time-tracking.schema';
import { ProjectsRepository } from '../projects/projects.repository';
import { TasksRepository } from '../tasks/tasks.repository';
import { TimeTrackingRepository } from '../time-tracking/time-tracking.repository';
import { ClientsRepository } from '../clients/clients.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: TimeEntry.name, schema: TimeEntrySchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    ProjectsRepository,
    TasksRepository,
    TimeTrackingRepository,
    ClientsRepository,
  ],
})
export class DashboardModule {}
