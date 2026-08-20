import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { ResourcesRepository } from './resources.repository';
import { Resource, ResourceSchema } from './resources.schema';
import {
  ResourceCategory,
  ResourceCategorySchema,
} from './resource-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resource.name, schema: ResourceSchema },
      { name: ResourceCategory.name, schema: ResourceCategorySchema },
    ]),
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService, ResourcesRepository],
  exports: [ResourcesService],
})
export class ResourcesModule {}
