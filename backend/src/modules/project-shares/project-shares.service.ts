import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ProjectSharesRepository } from './project-shares.repository';
import {
  CreateProjectShareDto,
  UpdateProjectShareDto,
} from './dto/share.dto';
import { ProjectsService } from '../projects/projects.service';

const DEFAULT_PERMS = {
  canCreate: true,
  canEdit: true,
  canComment: true,
  canUpload: true,
};

function sanitize(share: any) {
  if (!share) return share;
  const o = typeof share.toObject === 'function' ? share.toObject() : { ...share };
  delete o.passwordHash;
  return o;
}

@Injectable()
export class ProjectSharesService {
  constructor(
    private readonly sharesRepository: ProjectSharesRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async list(workspaceId: string, projectId: string) {
    await this.projectsService.findOne(workspaceId, projectId);
    const shares = await this.sharesRepository.findByProject(
      workspaceId,
      projectId,
    );
    return shares.map(sanitize);
  }

  async create(
    workspaceId: string,
    projectId: string,
    dto: CreateProjectShareDto,
  ) {
    await this.projectsService.findOne(workspaceId, projectId);
    const username = dto.username.toLowerCase().trim();
    const existing = await this.sharesRepository.findByUsername(username);
    if (existing)
      throw new ConflictException('Ese usuario ya está en uso en otro acceso');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const share = await this.sharesRepository.create(workspaceId, {
      projectId,
      label: dto.label.trim(),
      username,
      passwordHash,
      token: crypto.randomBytes(24).toString('hex'),
      permissions: { ...DEFAULT_PERMS, ...(dto.permissions ?? {}) },
      isActive: true,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
    return { share: sanitize(share), password: dto.password };
  }

  async update(
    workspaceId: string,
    projectId: string,
    shareId: string,
    dto: UpdateProjectShareDto,
  ) {
    const current = await this.sharesRepository.findOne(workspaceId, shareId);
    if (!current || (current as any).projectId !== projectId)
      throw new NotFoundException(`Share ${shareId} not found`);

    const patch: Record<string, any> = {};
    if (dto.label !== undefined) patch.label = dto.label.trim();
    if (dto.permissions !== undefined)
      patch.permissions = {
        ...((current as any).permissions ?? {}),
        ...dto.permissions,
      };
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;
    if (dto.expiresAt !== undefined)
      patch.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    let password: string | undefined;
    if (dto.password) {
      patch.passwordHash = await bcrypt.hash(dto.password, 10);
      password = dto.password;
    }
    const updated = await this.sharesRepository.update(
      workspaceId,
      shareId,
      patch,
    );
    return { share: sanitize(updated), password };
  }

  async regenerateToken(workspaceId: string, projectId: string, shareId: string) {
    const current = await this.sharesRepository.findOne(workspaceId, shareId);
    if (!current || (current as any).projectId !== projectId)
      throw new NotFoundException(`Share ${shareId} not found`);
    const updated = await this.sharesRepository.update(workspaceId, shareId, {
      token: crypto.randomBytes(24).toString('hex'),
    });
    return sanitize(updated);
  }

  async remove(workspaceId: string, projectId: string, shareId: string) {
    const current = await this.sharesRepository.findOne(workspaceId, shareId);
    if (!current || (current as any).projectId !== projectId)
      throw new NotFoundException(`Share ${shareId} not found`);
    await this.sharesRepository.softDelete(workspaceId, shareId);
    return { success: true };
  }

  /** Uso interno del portal: resuelve y valida vigencia. */
  async resolveActive(share: any) {
    if (!share || (share as any).isDeleted) return null;
    if ((share as any).isActive === false) return null;
    const exp = (share as any).expiresAt;
    if (exp && new Date(exp).getTime() < Date.now()) return null;
    try {
      await this.projectsService.findOne(
        (share as any).workspaceId,
        (share as any).projectId,
      );
    } catch {
      return null;
    }
    return share;
  }
}
