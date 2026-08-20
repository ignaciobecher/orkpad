import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule } from '../clients/clients.module';
import { ProjectsModule } from '../projects/projects.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { QuotesRepository } from './quotes.repository';
import { QuotesPdfService } from './quotes-pdf.service';
import { Quote, QuoteSchema } from './quotes.schema';

@Module({
  imports: [
    ClientsModule,
    ProjectsModule,
    InvoicesModule,
    MongooseModule.forFeature([{ name: Quote.name, schema: QuoteSchema }]),
  ],
  controllers: [QuotesController],
  providers: [QuotesService, QuotesRepository, QuotesPdfService],
  exports: [QuotesService],
})
export class QuotesModule {}
