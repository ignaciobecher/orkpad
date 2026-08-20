import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadSearchesController } from './lead-searches.controller';
import { LeadSearchesService } from './lead-searches.service';
import { LeadSearchesRepository } from './lead-searches.repository';
import { LeadSearch, LeadSearchSchema } from './lead-searches.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeadSearch.name, schema: LeadSearchSchema },
    ]),
  ],
  controllers: [LeadSearchesController],
  providers: [LeadSearchesService, LeadSearchesRepository],
  exports: [LeadSearchesService, LeadSearchesRepository],
})
export class LeadSearchesModule {}
