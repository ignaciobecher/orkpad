import { Injectable, NotFoundException } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNoteDto } from './dto/query-note.dto';
import { ReorderNotesDto } from './dto/reorder-notes.dto';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  findAll(workspaceId: string, query: QueryNoteDto) {
    const { page, limit, search, status, tags, projectId, clientId } = query;
    const filters: Record<string, any> = {};

    if (status) filters.status = status;
    if (projectId) filters.projectId = projectId;
    if (clientId) filters.clientId = clientId;
    if (tags?.length) filters.tags = { $in: tags };
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    return this.notesRepository.findAll(workspaceId, filters, {
      page,
      limit,
      sort: { isPinned: -1, order: 1, createdAt: -1 },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const note = await this.notesRepository.findOne(workspaceId, id);
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    return note;
  }

  create(workspaceId: string, dto: CreateNoteDto) {
    return this.notesRepository.create(workspaceId, dto);
  }

  async update(workspaceId: string, id: string, dto: UpdateNoteDto) {
    const note = await this.notesRepository.update(workspaceId, id, dto);
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    return note;
  }

  async toggle(workspaceId: string, id: string) {
    const note = await this.notesRepository.findOne(workspaceId, id);
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    const newStatus = note.status === 'active' ? 'done' : 'active';
    return this.notesRepository.update(workspaceId, id, { status: newStatus });
  }

  async pin(workspaceId: string, id: string) {
    const note = await this.notesRepository.findOne(workspaceId, id);
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    return this.notesRepository.update(workspaceId, id, {
      isPinned: !note.isPinned,
    });
  }

  async reorder(workspaceId: string, dto: ReorderNotesDto) {
    await this.notesRepository.updateOrder(workspaceId, dto.items);
    return { success: true };
  }

  async remove(workspaceId: string, id: string) {
    const note = await this.notesRepository.softDelete(workspaceId, id);
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    return note;
  }
}
