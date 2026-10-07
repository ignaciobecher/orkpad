import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsExportService } from './reports-export.service';
import { Invoice, InvoiceSchema } from '../invoices/invoices.schema';
import { Task, TaskSchema } from '../tasks/tasks.schema';
import { Project, ProjectSchema } from '../projects/projects.schema';
import { TimeEntry, TimeEntrySchema } from '../time-tracking/time-tracking.schema';
import { Client, ClientSchema } from '../clients/clients.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: TimeEntry.name, schema: TimeEntrySchema },
      { name: Client.name, schema: ClientSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsExportService],
})
export class ReportsModule {}
