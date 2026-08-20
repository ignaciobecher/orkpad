import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkspacesRepository } from './workspaces.repository';
import { WorkspaceDocument } from './workspaces.schema';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly workspacesRepository: WorkspacesRepository) {}

  async findById(id: string): Promise<WorkspaceDocument> {
    const workspace = await this.workspacesRepository.findById(id);
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async create(
    ownerId: string,
    dto: CreateWorkspaceDto,
  ): Promise<WorkspaceDocument> {
    const slug =
      dto.slug ??
      dto.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') +
        '-' +
        Date.now();
    return this.workspacesRepository.create({ ...dto, slug, ownerId });
  }

  async update(
    id: string,
    dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceDocument> {
    const workspace = await this.workspacesRepository.update(id, dto);
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async findBySlug(slug: string): Promise<WorkspaceDocument> {
    const workspace = await this.workspacesRepository.findBySlug(slug);
    if (!workspace) throw new NotFoundException('Portfolio not found');
    return workspace;
  }
}
