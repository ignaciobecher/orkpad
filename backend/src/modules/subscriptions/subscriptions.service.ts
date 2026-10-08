import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { normalizeCalendarDate } from '../../common/utils/dates';
import { SubscriptionsRepository } from './subscriptions.repository';
import { SubscriptionPaymentsRepository } from './subscription-payments.repository';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { QuerySubscriptionDto } from './dto/query-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly repository: SubscriptionsRepository,
    private readonly paymentsRepository: SubscriptionPaymentsRepository,
    private readonly clientsService: ClientsService,
  ) {}

  async findAll(workspaceId: string, query: QuerySubscriptionDto) {
    const { search, clientId, type, status, page, limit } = query;
    const filters: Record<string, any> = {};
    if (clientId) filters.clientId = clientId;
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (search) filters.planName = { $regex: search, $options: 'i' };
    const result = await this.repository.findAll(workspaceId, filters, {
      page,
      limit,
    });

    const ids = result.data.map((s: any) => String(s._id));
    const lastPaidMap = await this.paymentsRepository.findLastPaidBulk(
      workspaceId,
      ids,
    );

    const enriched = result.data.map((s: any) => {
      const plain = s.toObject ? s.toObject() : { ...s };
      plain.lastPaymentDate = lastPaidMap[String(s._id)] ?? null;
      return plain;
    });

    return { ...result, data: enriched };
  }

  async findOne(workspaceId: string, id: string) {
    const item = await this.repository.findOne(workspaceId, id);
    if (!item) throw new NotFoundException(`Subscription ${id} not found`);
    return item;
  }

  async create(workspaceId: string, dto: CreateSubscriptionDto) {
    await this.validateClient(workspaceId, dto.clientId, dto.type);
    const patch: Record<string, any> = { ...dto };
    const nextBillingDate = normalizeCalendarDate((dto as any).nextBillingDate);
    if (nextBillingDate) patch.nextBillingDate = nextBillingDate;
    return this.repository.create(workspaceId, patch);
  }

  async update(workspaceId: string, id: string, dto: UpdateSubscriptionDto) {
    if (dto.clientId !== undefined || dto.type !== undefined) {
      const current = await this.findOne(workspaceId, id);
      await this.validateClient(
        workspaceId,
        dto.clientId ?? current.clientId,
        dto.type ?? current.type,
      );
    }
    const patch: Record<string, any> = { ...dto };
    if ((dto as any).nextBillingDate !== undefined) {
      const normalized = normalizeCalendarDate((dto as any).nextBillingDate);
      if (normalized) patch.nextBillingDate = normalized;
    }
    const item = await this.repository.update(workspaceId, id, patch);
    if (!item) throw new NotFoundException(`Subscription ${id} not found`);
    return item;
  }

  async remove(workspaceId: string, id: string) {
    const item = await this.repository.softDelete(workspaceId, id);
    if (!item) throw new NotFoundException(`Subscription ${id} not found`);
    return item;
  }

  async findDemo(workspaceId: string) {
    return this.repository.findAll(
      workspaceId,
      { isDemo: true },
      { limit: 100 },
    );
  }

  private async validateClient(
    workspaceId: string,
    clientId: string | undefined | null,
    type?: 'income' | 'expense',
  ) {
    // Recurring expenses (servers, SaaS) have no client. Income retainers do.
    if (type === 'expense' && !clientId) return;
    if (!clientId) {
      throw new BadRequestException(
        'clientId must reference an existing client in the workspace',
      );
    }
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
