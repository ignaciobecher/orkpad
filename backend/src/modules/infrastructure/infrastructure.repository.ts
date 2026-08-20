import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  InfrastructureResource,
  InfrastructureResourceDocument,
} from './infrastructure.schema';

@Injectable()
export class InfrastructureResourcesRepository extends BaseRepository<InfrastructureResourceDocument> {
  constructor(
    @InjectModel(InfrastructureResource.name)
    private readonly infrastructureResourceModel: Model<InfrastructureResourceDocument>,
  ) {
    super(infrastructureResourceModel);
  }
}
