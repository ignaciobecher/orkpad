import { Injectable, NotFoundException } from '@nestjs/common';
import { MarketingPromptRepository } from './marketing-prompt.repository';
import { CreateMarketingPromptDto } from './dto/create-marketing-prompt.dto';
import { UpdateMarketingPromptDto } from './dto/update-marketing-prompt.dto';
import { QueryMarketingPromptDto } from './dto/query-marketing-prompt.dto';

@Injectable()
export class MarketingPromptService {
  constructor(
    private readonly marketingPromptRepository: MarketingPromptRepository,
  ) {}

  async findAll(workspaceId: string, query: QueryMarketingPromptDto) {
    const { network, category, search, page, limit } = query;

    const filters: Record<string, any> = {};
    if (network) filters.network = network;
    if (category) filters.category = category;
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { promptText: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    return this.marketingPromptRepository.findAll(workspaceId, filters, {
      page,
      limit,
    });
  }

  async findOne(workspaceId: string, id: string) {
    const prompt = await this.marketingPromptRepository.findOne(
      workspaceId,
      id,
    );
    if (!prompt) throw new NotFoundException(`Prompt ${id} not found`);
    return prompt;
  }

  create(workspaceId: string, userId: string, dto: CreateMarketingPromptDto) {
    return this.marketingPromptRepository.create(workspaceId, {
      ...dto,
      userId,
    });
  }

  async update(workspaceId: string, id: string, dto: UpdateMarketingPromptDto) {
    const prompt = await this.marketingPromptRepository.update(
      workspaceId,
      id,
      dto,
    );
    if (!prompt) throw new NotFoundException(`Prompt ${id} not found`);
    return prompt;
  }

  async remove(workspaceId: string, id: string) {
    const prompt = await this.marketingPromptRepository.softDelete(
      workspaceId,
      id,
    );
    if (!prompt) throw new NotFoundException(`Prompt ${id} not found`);
    return prompt;
  }
}
