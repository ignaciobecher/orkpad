import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentsRepository } from './docs.repository';
import { CreateDocumentDto } from './dto/create-doc.dto';
import { UpdateDocumentDto } from './dto/update-doc.dto';
import { QueryDocumentDto } from './dto/query-doc.dto';
import { AiIndexService } from '../ai/ai-index.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly repository: DocumentsRepository,
    private readonly aiIndex: AiIndexService,
  ) {}

  async findAll(workspaceId: string, query: QueryDocumentDto) {
    const { page, limit, search } = query;
    const filters: Record<string, any> = {};

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    return this.repository.findAll(workspaceId, filters, { page, limit });
  }

  async findOne(workspaceId: string, id: string) {
    const item = await this.repository.findOne(workspaceId, id);
    if (!item) throw new NotFoundException(`Document ${id} not found`);
    return item;
  }

  async create(workspaceId: string, dto: CreateDocumentDto) {
    const item = await this.repository.create(workspaceId, dto);
    this.aiIndex.notifyChanged(workspaceId, 'doc', (item._id as any).toString());
    return item;
  }

  async update(workspaceId: string, id: string, dto: UpdateDocumentDto) {
    const item = await this.repository.update(workspaceId, id, dto);
    if (!item) throw new NotFoundException(`Document ${id} not found`);
    this.aiIndex.notifyChanged(workspaceId, 'doc', id);
    return item;
  }

  async remove(workspaceId: string, id: string) {
    const item = await this.repository.softDelete(workspaceId, id);
    if (!item) throw new NotFoundException(`Document ${id} not found`);
    this.aiIndex.notifyChanged(workspaceId, 'doc', id, true);
    return item;
  }
}
