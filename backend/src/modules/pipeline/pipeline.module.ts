import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule } from '../clients/clients.module';
import { DealsController } from './pipeline.controller';
import { DealsService } from './pipeline.service';
import { DealsRepository } from './pipeline.repository';
import { Deal, DealSchema } from './pipeline.schema';

@Module({
  imports: [
    ClientsModule,
    MongooseModule.forFeature([{ name: Deal.name, schema: DealSchema }]),
  ],
  controllers: [DealsController],
  providers: [DealsService, DealsRepository],
  exports: [DealsService],
})
export class DealsModule {}
