import { Injectable, NotFoundException } from '@nestjs/common';
import { EventsRepository } from './agenda.repository';
import { CreateEventDto } from './dto/create-agenda.dto';
import { UpdateEventDto } from './dto/update-agenda.dto';
import { QueryEventDto } from './dto/query-agenda.dto';

@Injectable()
export class EventsService {
  constructor(private readonly repository: EventsRepository) {}

  async findAll(workspaceId: string, query: QueryEventDto) {
    const { page, limit, search } = query;
    const filters: Record<string, any> = {};

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return this.repository.findAll(workspaceId, filters, { page, limit });
  }

  async findOne(workspaceId: string, id: string) {
    const item = await this.repository.findOne(workspaceId, id);
    if (!item) throw new NotFoundException(`Event ${id} not found`);
    return item;
  }

  async create(workspaceId: string, dto: CreateEventDto) {
    return this.repository.create(workspaceId, dto);
  }

  async update(workspaceId: string, id: string, dto: UpdateEventDto) {
    const item = await this.repository.update(workspaceId, id, dto);
    if (!item) throw new NotFoundException(`Event ${id} not found`);
    return item;
  }

  async remove(workspaceId: string, id: string) {
    const item = await this.repository.softDelete(workspaceId, id);
    if (!item) throw new NotFoundException(`Event ${id} not found`);
    return item;
  }
}
