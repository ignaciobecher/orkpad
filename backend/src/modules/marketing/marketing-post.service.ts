import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MarketingPostRepository } from './marketing-post.repository';
import { CreateMarketingPostDto } from './dto/create-marketing-post.dto';
import { UpdateMarketingPostDto } from './dto/update-marketing-post.dto';
import { QueryMarketingPostDto } from './dto/query-marketing-post.dto';
import { RecordPostMetricsDto } from './dto/record-post-metrics.dto';
import { ImportMarketingPostRowDto } from './dto/import-marketing-post.dto';

/**
 * Date-only strings (e.g. "2026-06-30" from an <input type="date">) parse to UTC
 * midnight, which can render as the previous day in timezones behind UTC. Pinning
 * to noon UTC keeps the calendar date stable across all timezones.
 */
function normalizeScheduledDate(
  value: string | null | undefined,
): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  return new Date(dateOnly ? `${value}T12:00:00.000Z` : value);
}

@Injectable()
export class MarketingPostService {
  constructor(
    private readonly marketingPostRepository: MarketingPostRepository,
  ) {}

  async findAll(workspaceId: string, query: QueryMarketingPostDto) {
    const { status, network, format, ideaId, from, to, page, limit } = query;

    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (network) filters.network = network;
    if (format) filters.format = format;
    if (ideaId) filters.ideaId = ideaId;
    if (from || to) {
      filters.scheduledDate = {};
      if (from) filters.scheduledDate.$gte = new Date(from + 'T00:00:00.000Z');
      if (to) filters.scheduledDate.$lte = new Date(to + 'T23:59:59.999Z');
    }

    return this.marketingPostRepository.findAll(workspaceId, filters, {
      page,
      limit,
    });
  }

  async findCalendar(
    workspaceId: string,
    from: string,
    to: string,
    network?: string,
  ) {
    const filters: Record<string, any> = {};
    if (network) filters.network = network;
    return this.marketingPostRepository.findByDateRange(
      workspaceId,
      new Date(from + 'T00:00:00.000Z'),
      new Date(to + 'T23:59:59.999Z'),
      filters,
    );
  }

  async findOne(workspaceId: string, id: string) {
    const post = await this.marketingPostRepository.findOne(workspaceId, id);
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }

  create(workspaceId: string, userId: string, dto: CreateMarketingPostDto) {
    return this.marketingPostRepository.create(workspaceId, {
      ...dto,
      scheduledDate: normalizeScheduledDate(dto.scheduledDate),
      userId,
    });
  }

  async bulkCreate(
    workspaceId: string,
    userId: string,
    rows: ImportMarketingPostRowDto[],
  ) {
    if (!rows.length) {
      throw new BadRequestException('No hay filas para importar');
    }

    const documents = rows.map((row) => ({
      title: row.title,
      copyText: row.copyText,
      network: row.network,
      format: row.format,
      scheduledDate: normalizeScheduledDate(row.scheduledDate),
      status: row.status ?? 'idea',
      ideaId: row.ideaId ?? null,
      attachmentUrl: row.attachmentUrl ?? null,
      analysisNotes: row.analysisNotes,
      userId,
    }));

    return this.marketingPostRepository.bulkCreate(workspaceId, documents);
  }

  async update(workspaceId: string, id: string, dto: UpdateMarketingPostDto) {
    const update: Record<string, any> = { ...dto };
    if (dto.scheduledDate !== undefined) {
      update.scheduledDate = normalizeScheduledDate(dto.scheduledDate);
    }

    const post = await this.marketingPostRepository.update(
      workspaceId,
      id,
      update,
    );
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }

  async remove(workspaceId: string, id: string) {
    const post = await this.marketingPostRepository.softDelete(workspaceId, id);
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }

  async recordMetrics(
    workspaceId: string,
    id: string,
    dto: RecordPostMetricsDto,
  ) {
    const post = await this.findOne(workspaceId, id);
    if ((post as any).status !== 'publicado') {
      throw new BadRequestException(
        'Solo se pueden cargar métricas de publicaciones en estado "publicado"',
      );
    }

    const { analysisNotes, ...metricsFields } = dto;
    const update: Record<string, any> = {
      metrics: { ...metricsFields, recordedAt: new Date() },
    };
    if (analysisNotes !== undefined) update.analysisNotes = analysisNotes;

    const updated = await this.marketingPostRepository.update(
      workspaceId,
      id,
      update,
    );
    if (!updated) throw new NotFoundException(`Post ${id} not found`);
    return updated;
  }
}
