import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Client, ClientDocument } from './clients.schema';

@Injectable()
export class ClientsRepository extends BaseRepository<ClientDocument> {
  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
  ) {
    super(clientModel);
  }

  async findNamesByIds(
    workspaceId: string,
    clientIds: string[],
  ): Promise<Map<string, string>> {
    if (!clientIds.length) return new Map();

    const clients = await this.clientModel
      .find({ workspaceId, isDeleted: false, _id: { $in: clientIds } })
      .select('_id name')
      .exec();

    return new Map(clients.map((c) => [(c._id as any).toString(), c.name]));
  }
}
