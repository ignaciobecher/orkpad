import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LeadsRepository } from './leads.repository';
import { EmailFinderService } from './email-finder.service';
import { Lead, LeadSchema } from './leads.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
  ],
  controllers: [LeadsController],
  providers: [LeadsService, LeadsRepository, EmailFinderService],
  exports: [LeadsService, LeadsRepository, EmailFinderService],
})
export class LeadsModule {}
