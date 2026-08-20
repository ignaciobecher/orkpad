import { Injectable, NotFoundException } from '@nestjs/common';
import { MarketingIdeaRepository } from './marketing-idea.repository';
import { CreateMarketingIdeaDto } from './dto/create-marketing-idea.dto';
import { UpdateMarketingIdeaDto } from './dto/update-marketing-idea.dto';
import { QueryMarketingIdeaDto } from './dto/query-marketing-idea.dto';

const STATUSES = ['idea', 'borrador', 'listo', 'publicado'] as const;

@Injectable()
export class MarketingIdeaService {
  constructor(
    private readonly marketingIdeaRepository: MarketingIdeaRepository,
  ) {}

  async findAll(workspaceId: string, query: QueryMarketingIdeaDto) {
    const { status, network, search, page, limit } = query;

    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (network) filters.networks = network;
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return this.marketingIdeaRepository.findAll(workspaceId, filters, {
      page,
      limit,
    });
  }

  async kanban(workspaceId: string) {
    const board: Record<string, any[]> = {};
    await Promise.all(
      STATUSES.map(async (status) => {
        const result = await this.marketingIdeaRepository.findAll(
          workspaceId,
          { status },
          { limit: 100, sort: { createdAt: -1 } },
        );
        board[status] = result.data;
      }),
    );
    return board;
  }

  async findOne(workspaceId: string, id: string) {
    const idea = await this.marketingIdeaRepository.findOne(workspaceId, id);
    if (!idea) throw new NotFoundException(`Idea ${id} not found`);
    return idea;
  }

  create(workspaceId: string, userId: string, dto: CreateMarketingIdeaDto) {
    return this.marketingIdeaRepository.create(workspaceId, { ...dto, userId });
  }

  async update(workspaceId: string, id: string, dto: UpdateMarketingIdeaDto) {
    const idea = await this.marketingIdeaRepository.update(
      workspaceId,
      id,
      dto,
    );
    if (!idea) throw new NotFoundException(`Idea ${id} not found`);
    return idea;
  }

  async remove(workspaceId: string, id: string) {
    const idea = await this.marketingIdeaRepository.softDelete(workspaceId, id);
    if (!idea) throw new NotFoundException(`Idea ${id} not found`);
    return idea;
  }
}
