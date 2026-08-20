import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { TaskColumnsRepository } from './task-columns.repository';
import { CreateTaskColumnDto } from './dto/create-task-column.dto';
import { UpdateTaskColumnDto } from './dto/update-task-column.dto';

@Injectable()
export class TaskColumnsService {
  constructor(
    private readonly repo: TaskColumnsRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  findAll(workspaceId: string, projectId: string) {
    return this.repo.findAllOrdered(workspaceId, projectId);
  }

  async findOne(workspaceId: string, id: string) {
    const col = await this.repo.findOne(workspaceId, id);
    if (!col) throw new NotFoundException(`Column ${id} not found`);
    return col;
  }

  async create(workspaceId: string, dto: CreateTaskColumnDto) {
    await this.validateProject(workspaceId, dto.projectId);
    const existing = await this.repo.findAllOrdered(workspaceId, dto.projectId);
    const order = dto.order ?? existing.length;
    return this.repo.create(workspaceId, { ...dto, order });
  }

  async update(workspaceId: string, id: string, dto: UpdateTaskColumnDto) {
    if (dto.projectId !== undefined) {
      await this.validateProject(workspaceId, dto.projectId);
    }
    const col = await this.repo.update(workspaceId, id, dto);
    if (!col) throw new NotFoundException(`Column ${id} not found`);
    return col;
  }

  async remove(workspaceId: string, id: string) {
    const col = await this.repo.softDelete(workspaceId, id);
    if (!col) throw new NotFoundException(`Column ${id} not found`);
    return col;
  }

  async reorder(workspaceId: string, ids: string[]) {
    await Promise.all(
      ids.map((id, index) =>
        this.repo.update(workspaceId, id, { order: index } as any),
      ),
    );
    return { success: true };
  }

  private async validateProject(workspaceId: string, projectId?: string) {
    if (!projectId) return;

    const project = await this.projectsService
      .findOne(workspaceId, projectId)
      .catch(() => null);
    if (!project) {
      throw new BadRequestException(
        'projectId must reference an existing project in the workspace',
      );
    }
  }
}
