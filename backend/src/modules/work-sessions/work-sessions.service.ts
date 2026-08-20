import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WorkSessionsRepository } from './work-sessions.repository';
import { CreateWorkSessionDto } from './dto/create-work-session.dto';
import { UpdateWorkSessionDto } from './dto/update-work-session.dto';
import { QueryWorkSessionDto } from './dto/query-work-session.dto';

const STALE_HOURS = 16;

@Injectable()
export class WorkSessionsService {
  private readonly logger = new Logger(WorkSessionsService.name);

  constructor(private readonly repository: WorkSessionsRepository) {}

  findAll(workspaceId: string, query: QueryWorkSessionDto) {
    const { page, limit, userId } = query;
    const filters: Record<string, any> = {};
    if (userId) filters.userId = userId;
    return this.repository.findAll(workspaceId, filters, {
      page,
      limit,
      sort: { startTime: -1 },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const session = await this.repository.findOne(workspaceId, id);
    if (!session) throw new NotFoundException('Jornada no encontrada');
    return session;
  }

  async findActive(workspaceId: string, userId: string) {
    return this.repository.findActive(workspaceId, userId);
  }

  async start(workspaceId: string, userId: string, dto: CreateWorkSessionDto) {
    const existing = await this.repository.findActive(workspaceId, userId);
    if (existing) {
      throw new BadRequestException(
        'Ya tienes una jornada activa. Finalízala primero.',
      );
    }
    try {
      return await this.repository.create(workspaceId, {
        userId,
        startTime: dto.startTime ? new Date(dto.startTime) : new Date(),
        notes: dto.notes ?? null,
      });
    } catch (err: any) {
      // The check above is only a UX fast-path for the non-concurrent case;
      // the actual guarantee is the schema's partial unique index. Do not
      // remove this catch — without it, a real race leaks as a raw 500.
      if (err?.code === 11000) {
        throw new BadRequestException(
          'Ya tienes una jornada activa. Finalízala primero.',
        );
      }
      throw err;
    }
  }

  async end(workspaceId: string, id: string) {
    const updated = await this.repository.endActive(
      workspaceId,
      id,
      new Date(),
    );
    if (updated) return updated;

    const session = await this.repository.findOne(workspaceId, id);
    if (!session) throw new NotFoundException('Jornada no encontrada');
    throw new BadRequestException('La jornada ya fue finalizada');
  }

  async update(workspaceId: string, id: string, dto: UpdateWorkSessionDto) {
    const updated = await this.repository.update(workspaceId, id, dto);
    if (!updated) throw new NotFoundException('Jornada no encontrada');
    return updated;
  }

  async remove(workspaceId: string, id: string) {
    const session = await this.repository.softDelete(workspaceId, id);
    if (!session) throw new NotFoundException('Jornada no encontrada');
    return session;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async closeStaleActiveSessions() {
    const threshold = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000);
    const stale = await this.repository.findAllStaleActive(threshold);
    if (!stale.length) return;

    await Promise.all(
      stale.map((session) =>
        this.repository.endActive(
          session.workspaceId,
          String(session._id),
          new Date(session.startTime.getTime() + STALE_HOURS * 60 * 60 * 1000),
        ),
      ),
    );

    this.logger.log(
      `Auto-closed ${stale.length} stale work session(s) (>${STALE_HOURS}h sin finalizar)`,
    );
  }
}
