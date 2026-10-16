import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ProjectSharesRepository } from '../project-shares/project-shares.repository';
import { ProjectSharesService } from '../project-shares/project-shares.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { TaskColumnsService } from '../task-columns/task-columns.service';
import { TaskCommentsService } from '../task-comments/task-comments.service';
import { TaskActivitiesService } from '../task-activities/task-activities.service';
import { StorageService } from '../storage/storage.service';
import type { PortalContext } from './portal-context.decorator';

const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

@Injectable()
export class PortalService {
  constructor(
    private readonly sharesRepository: ProjectSharesRepository,
    private readonly sharesService: ProjectSharesService,
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    private readonly columnsService: TaskColumnsService,
    private readonly commentsService: TaskCommentsService,
    private readonly activitiesService: TaskActivitiesService,
    private readonly storageService: StorageService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private checkThrottle(key: string) {
    const now = Date.now();
    const entry = attempts.get(key);
    if (entry && entry.resetAt < now) attempts.delete(key);
    const cur = attempts.get(key);
    if (cur && cur.count >= LOGIN_MAX_ATTEMPTS)
      throw new UnauthorizedException(
        'Demasiados intentos. Esperá unos minutos.',
      );
  }

  private registerFailure(key: string) {
    const now = Date.now();
    const cur = attempts.get(key);
    if (!cur || cur.resetAt < now)
      attempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    else cur.count += 1;
  }

  async login(username: string, password: string) {
    const key = `portal:${username.toLowerCase().trim()}`;
    this.checkThrottle(key);
    const share = await this.sharesRepository.findByUsername(username);
    const active = await this.sharesService.resolveActive(share);
    const hash = (share as any)?.passwordHash as string | undefined;
    const ok =
      active && hash ? await bcrypt.compare(password, hash).catch(() => false) : false;
    if (!active || !ok) {
      this.registerFailure(key);
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    attempts.delete(key);
    const workspaceId = (active as any).workspaceId;
    const projectId = (active as any).projectId;
    const shareId = (active as any)._id.toString();
    const expiresIn =
      this.configService.get<string>('PROJECT_LINK_JWT_EXPIRES_IN') ?? '7d';
    const token = await this.jwtService.signAsync(
      { type: 'portal', shareId, projectId, workspaceId, sub: shareId },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn,
      } as any,
    );
    await this.sharesRepository.touchAccess(workspaceId, shareId);
    const project = await this.projectsService
      .findOne(workspaceId, projectId)
      .catch(() => null);
    return {
      token,
      shareId,
      project: project
        ? {
            _id: (project as any)._id,
            name: (project as any).name,
            description: (project as any).description,
            status: (project as any).status,
          }
        : null,
      permissions: (active as any).permissions ?? {},
      label: (active as any).label,
    };
  }

  async shareInfo(token: string) {
    const share = await this.sharesRepository.findByToken(token);
    const active = await this.sharesService.resolveActive(share);
    if (!active) throw new NotFoundException('Enlace inválido o vencido');
    const project = await this.projectsService
      .findOne((active as any).workspaceId, (active as any).projectId)
      .catch(() => null);
    return {
      username: (active as any).username,
      label: (active as any).label,
      projectName: project ? (project as any).name : 'Proyecto',
    };
  }

  private perms(ctx: PortalContext) {
    return {
      canCreate: true,
      canEdit: true,
      canComment: true,
      canUpload: true,
      ...((ctx.share as any).permissions ?? {}),
    };
  }

  private requirePerm(ctx: PortalContext, perm: keyof ReturnType<PortalService['perms']>) {
    if (!this.perms(ctx)[perm])
      throw new ForbiddenException('Tu acceso no permite esta acción');
  }

  async getProject(ctx: PortalContext) {
    const project = await this.projectsService.findOne(
      ctx.workspaceId,
      ctx.projectId,
    );
    const p = project as any;
    return {
      _id: p._id,
      name: p.name,
      description: p.description,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      permissions: this.perms(ctx),
      label: (ctx.share as any).label,
    };
  }

  getColumns(ctx: PortalContext) {
    return this.columnsService.findAll(ctx.workspaceId, ctx.projectId);
  }

  async getTasks(ctx: PortalContext, includeArchived = false) {
    const all: any[] = [];
    let page = 1;
    for (;;) {
      const res = await this.tasksService.findAll(ctx.workspaceId, {
        projectId: ctx.projectId,
        page,
        limit: 100,
        archived: includeArchived as any,
      } as any);
      all.push(...res.data);
      if (all.length >= res.total || res.data.length === 0) break;
      page += 1;
      if (page > 20) break;
    }
    return { data: all, total: all.length };
  }

  /** Obtiene la tarea verificando que pertenezca al proyecto del acceso. */
  private async scopedTask(ctx: PortalContext, taskId: string) {
    const task = await this.tasksService
      .findOne(ctx.workspaceId, taskId)
      .catch(() => null);
    if (!task || (task as any).projectId !== ctx.projectId)
      throw new NotFoundException(`Task ${taskId} not found`);
    return task;
  }

  async createTask(ctx: PortalContext, dto: any) {
    this.requirePerm(ctx, 'canCreate');
    const columnId = dto.columnId;
    if (!columnId) throw new ForbiddenException('Falta la columna destino');
    const column = await this.columnsService
      .findOne(ctx.workspaceId, columnId)
      .catch(() => null);
    if (!column || (column as any).projectId !== ctx.projectId)
      throw new ForbiddenException('Columna inválida');
    return this.tasksService.create(
      ctx.workspaceId,
      {
        title: String(dto.title ?? '').slice(0, 200),
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate,
        startDate: dto.startDate,
        columnId,
        projectId: ctx.projectId,
        order: dto.order ?? 0,
        checklist: dto.checklist,
        labels: dto.labels,
      } as any,
      ctx.actor,
    );
  }

  async updateTask(ctx: PortalContext, taskId: string, dto: any) {
    this.requirePerm(ctx, 'canEdit');
    await this.scopedTask(ctx, taskId);
    const safe: Record<string, any> = {};
    for (const k of [
      'title',
      'description',
      'priority',
      'status',
      'dueDate',
      'startDate',
      'checklist',
      'labels',
      'coverColor',
      'coverAttachmentId',
      'archived',
    ]) {
      if (dto[k] !== undefined) safe[k] = dto[k];
    }
    // El cliente no gestiona miembros internos ni asignados
    return this.tasksService.update(ctx.workspaceId, taskId, safe as any, ctx.actor);
  }

  async moveTask(ctx: PortalContext, taskId: string, dto: any) {
    this.requirePerm(ctx, 'canEdit');
    await this.scopedTask(ctx, taskId);
    const column = await this.columnsService
      .findOne(ctx.workspaceId, dto.columnId)
      .catch(() => null);
    if (!column || (column as any).projectId !== ctx.projectId)
      throw new ForbiddenException('Columna inválida');
    return this.tasksService.move(
      ctx.workspaceId,
      taskId,
      { columnId: dto.columnId, order: dto.order ?? 0 },
      ctx.actor,
    );
  }

  async listComments(ctx: PortalContext, taskId: string, page = 1, limit = 50) {
    await this.scopedTask(ctx, taskId);
    return this.commentsService.findByTask(ctx.workspaceId, taskId, page, limit);
  }

  async addComment(ctx: PortalContext, taskId: string, dto: any) {
    this.requirePerm(ctx, 'canComment');
    await this.scopedTask(ctx, taskId);
    return this.commentsService.create(
      ctx.workspaceId,
      taskId,
      ctx.actor.userId,
      { text: String(dto.text ?? '').slice(0, 5000), mentions: dto.mentions },
      ctx.actor.name,
    );
  }

  async updateComment(
    ctx: PortalContext,
    taskId: string,
    commentId: string,
    dto: any,
  ) {
    this.requirePerm(ctx, 'canComment');
    await this.scopedTask(ctx, taskId);
    await this.assertOwnComment(ctx, taskId, commentId);
    return this.commentsService.update(
      ctx.workspaceId,
      taskId,
      commentId,
      ctx.actor.userId,
      { text: String(dto.text ?? '').slice(0, 5000) },
    );
  }

  async removeComment(ctx: PortalContext, taskId: string, commentId: string) {
    this.requirePerm(ctx, 'canComment');
    await this.scopedTask(ctx, taskId);
    await this.assertOwnComment(ctx, taskId, commentId);
    return this.commentsService.remove(ctx.workspaceId, taskId, commentId);
  }

  private async assertOwnComment(
    ctx: PortalContext,
    taskId: string,
    commentId: string,
  ) {
    const res = await this.commentsService.findByTask(
      ctx.workspaceId,
      taskId,
      1,
      100,
    );
    const found = (res.data as any[]).find(
      (c) => c._id.toString() === commentId,
    );
    if (!found) throw new NotFoundException(`Comment ${commentId} not found`);
    if (found.authorId !== ctx.actor.userId)
      throw new ForbiddenException('Solo podés editar tus comentarios');
  }

  async listActivities(ctx: PortalContext, taskId: string, page = 1, limit = 50) {
    await this.scopedTask(ctx, taskId);
    return this.activitiesService.findByTask(ctx.workspaceId, taskId, page, limit);
  }

  async addAttachment(
    ctx: PortalContext,
    taskId: string,
    file: { buffer: Buffer; originalName: string; mimeType: string },
  ) {
    this.requirePerm(ctx, 'canUpload');
    await this.scopedTask(ctx, taskId);
    return this.tasksService.addAttachment(
      ctx.workspaceId,
      taskId,
      file,
      ctx.actor,
    );
  }

  async removeAttachment(ctx: PortalContext, taskId: string, fileId: string) {
    this.requirePerm(ctx, 'canUpload');
    await this.scopedTask(ctx, taskId);
    return this.tasksService.removeAttachment(
      ctx.workspaceId,
      taskId,
      fileId,
      ctx.actor,
    );
  }

  async downloadAttachment(ctx: PortalContext, taskId: string, fileId: string) {
    const task = await this.scopedTask(ctx, taskId);
    const found = ((task as any).attachments ?? []).find(
      (a: any) => a.id === fileId,
    );
    if (!found) throw new NotFoundException('Archivo no encontrado');
    return this.storageService.read(ctx.workspaceId, fileId);
  }
}
