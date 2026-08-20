import { Injectable, NotFoundException } from '@nestjs/common';
import { InfrastructureResourcesRepository } from './infrastructure.repository';
import { CreateInfrastructureResourceDto } from './dto/create-infrastructure.dto';
import { UpdateInfrastructureResourceDto } from './dto/update-infrastructure.dto';
import { QueryInfrastructureResourceDto } from './dto/query-infrastructure.dto';

@Injectable()
export class InfrastructureResourcesService {
  constructor(private readonly repository: InfrastructureResourcesRepository) {}

  async findAll(workspaceId: string, query: QueryInfrastructureResourceDto) {
    const { page, limit, search } = query;
    const filters: Record<string, any> = {};

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }

    return this.repository.findAll(workspaceId, filters, { page, limit });
  }

  async findOne(workspaceId: string, id: string) {
    const item = await this.repository.findOne(workspaceId, id);
    if (!item)
      throw new NotFoundException(`InfrastructureResource ${id} not found`);
    return item;
  }

  async create(workspaceId: string, dto: CreateInfrastructureResourceDto) {
    return this.repository.create(workspaceId, dto);
  }

  async update(
    workspaceId: string,
    id: string,
    dto: UpdateInfrastructureResourceDto,
  ) {
    const item = await this.repository.update(workspaceId, id, dto);
    if (!item)
      throw new NotFoundException(`InfrastructureResource ${id} not found`);
    return item;
  }

  async remove(workspaceId: string, id: string) {
    const item = await this.repository.softDelete(workspaceId, id);
    if (!item)
      throw new NotFoundException(`InfrastructureResource ${id} not found`);
    return item;
  }
}
