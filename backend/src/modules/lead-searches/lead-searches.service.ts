import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadSearchesRepository } from './lead-searches.repository';
import { CreateLeadSearchDto } from './dto/create-lead-search.dto';
import { QueryLeadSearchDto } from './dto/query-lead-search.dto';

@Injectable()
export class LeadSearchesService {
  constructor(
    private readonly leadSearchesRepository: LeadSearchesRepository,
  ) {}

  findAll(workspaceId: string, query: QueryLeadSearchDto) {
    const { page, limit, status, search } = query;
    const filters: Record<string, any> = {};

    if (status) filters.status = status;
    if (search) {
      filters.$or = [
        { query: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    return this.leadSearchesRepository.findAll(workspaceId, filters, {
      page,
      limit,
    });
  }

  async findOne(workspaceId: string, id: string) {
    const search = await this.leadSearchesRepository.findOne(workspaceId, id);
    if (!search) throw new NotFoundException(`Lead search ${id} not found`);
    return search;
  }

  create(workspaceId: string, dto: CreateLeadSearchDto) {
    return this.leadSearchesRepository.create(workspaceId, {
      ...dto,
      status: 'pending',
      totalFound: 0,
      leadsImported: 0,
    });
  }

  async remove(workspaceId: string, id: string) {
    const search = await this.leadSearchesRepository.softDelete(
      workspaceId,
      id,
    );
    if (!search) throw new NotFoundException(`Lead search ${id} not found`);
    return search;
  }
}
