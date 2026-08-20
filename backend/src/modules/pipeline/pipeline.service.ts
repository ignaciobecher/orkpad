import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { DealsRepository } from './pipeline.repository';
import { CreateDealDto } from './dto/create-pipeline.dto';
import { UpdateDealDto } from './dto/update-pipeline.dto';
import { QueryDealDto } from './dto/query-pipeline.dto';

@Injectable()
export class DealsService {
  constructor(
    private readonly repository: DealsRepository,
    private readonly clientsService: ClientsService,
  ) {}

  async findAll(workspaceId: string, query: QueryDealDto) {
    const { search, clientId, stage, page, limit } = query;
    const filters: Record<string, any> = {};
    if (clientId) filters.clientId = clientId;
    if (stage) filters.stage = stage;
    if (search) filters.title = { $regex: search, $options: 'i' };
    return this.repository.findAll(workspaceId, filters, { page, limit });
  }

  async findOne(workspaceId: string, id: string) {
    const item = await this.repository.findOne(workspaceId, id);
    if (!item) throw new NotFoundException(`Deal ${id} not found`);
    return item;
  }

  async create(workspaceId: string, dto: CreateDealDto) {
    await this.validateRelations(workspaceId, dto.clientId);
    return this.repository.create(workspaceId, dto);
  }

  async update(workspaceId: string, id: string, dto: UpdateDealDto) {
    if (dto.clientId !== undefined) {
      await this.validateRelations(workspaceId, dto.clientId);
    }
    const item = await this.repository.update(workspaceId, id, dto);
    if (!item) throw new NotFoundException(`Deal ${id} not found`);
    return item;
  }

  async remove(workspaceId: string, id: string) {
    const item = await this.repository.softDelete(workspaceId, id);
    if (!item) throw new NotFoundException(`Deal ${id} not found`);
    return item;
  }

  private async validateRelations(workspaceId: string, clientId?: string) {
    if (!clientId) return;

    const client = await this.clientsService
      .findOne(workspaceId, clientId)
      .catch(() => null);
    if (!client) {
      throw new BadRequestException(
        'clientId must reference an existing client in the workspace',
      );
    }
  }
}
