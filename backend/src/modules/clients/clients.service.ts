import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  findAll(workspaceId: string, query: QueryClientDto) {
    const { page, limit, search, status } = query;
    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (search)
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    return this.clientsRepository.findAll(workspaceId, filters, {
      page,
      limit,
    });
  }

  async findOne(workspaceId: string, id: string) {
    const client = await this.clientsRepository.findOne(workspaceId, id);
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  create(workspaceId: string, dto: CreateClientDto) {
    return this.clientsRepository.create(workspaceId, dto);
  }

  async update(workspaceId: string, id: string, dto: UpdateClientDto) {
    const client = await this.clientsRepository.update(workspaceId, id, dto);
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  async remove(workspaceId: string, id: string) {
    const client = await this.clientsRepository.softDelete(workspaceId, id);
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  async findDemo(workspaceId: string) {
    return this.clientsRepository.findAll(
      workspaceId,
      { isDemo: true },
      { limit: 100 },
    );
  }
}
