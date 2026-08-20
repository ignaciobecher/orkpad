import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InfrastructureResourcesController } from './infrastructure.controller';
import { InfrastructureResourcesService } from './infrastructure.service';
import { InfrastructureResourcesRepository } from './infrastructure.repository';
import {
  InfrastructureResource,
  InfrastructureResourceSchema,
} from './infrastructure.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: InfrastructureResource.name,
        schema: InfrastructureResourceSchema,
      },
    ]),
  ],
  controllers: [InfrastructureResourcesController],
  providers: [
    InfrastructureResourcesService,
    InfrastructureResourcesRepository,
  ],
  exports: [InfrastructureResourcesService],
})
export class InfrastructureResourcesModule {}
