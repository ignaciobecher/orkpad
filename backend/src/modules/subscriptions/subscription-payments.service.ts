import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionPaymentsRepository } from './subscription-payments.repository';
import { SubscriptionsRepository } from './subscriptions.repository';
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';
import { UpdateSubscriptionPaymentDto } from './dto/update-subscription-payment.dto';
import { normalizeCalendarDate, todayNoonUTC } from '../../common/utils/dates';

@Injectable()
export class SubscriptionPaymentsService {
  constructor(
    private readonly repository: SubscriptionPaymentsRepository,
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  async findBySubscription(workspaceId: string, subscriptionId: string) {
    await this.assertSubscriptionExists(workspaceId, subscriptionId);
    return this.repository.findBySubscription(workspaceId, subscriptionId);
  }

  async create(
    workspaceId: string,
    subscriptionId: string,
    dto: CreateSubscriptionPaymentDto,
  ) {
    await this.assertSubscriptionExists(workspaceId, subscriptionId);
    const dueDate = normalizeCalendarDate((dto as any).dueDate);
    return this.repository.create(workspaceId, {
      ...dto,
      ...(dueDate ? { dueDate } : {}),
      subscriptionId,
      status: 'pending',
    });
  }

  async markPaid(workspaceId: string, subscriptionId: string, id: string) {
    await this.assertSubscriptionExists(workspaceId, subscriptionId);
    const payment = await this.repository.update(workspaceId, id, {
      status: 'paid',
      paidAt: todayNoonUTC(),
    });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  async markPending(workspaceId: string, subscriptionId: string, id: string) {
    await this.assertSubscriptionExists(workspaceId, subscriptionId);
    const payment = await this.repository.update(workspaceId, id, {
      status: 'pending',
      paidAt: null,
    });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  async update(
    workspaceId: string,
    subscriptionId: string,
    id: string,
    dto: UpdateSubscriptionPaymentDto,
  ) {
    await this.assertSubscriptionExists(workspaceId, subscriptionId);
    const patch: Record<string, any> = { ...dto };
    for (const key of ['dueDate', 'paidAt'] as const) {
      if ((dto as any)[key] !== undefined) {
        const normalized = normalizeCalendarDate((dto as any)[key]);
        if (normalized) patch[key] = normalized;
      }
    }
    const payment = await this.repository.update(workspaceId, id, patch);
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  async remove(workspaceId: string, subscriptionId: string, id: string) {
    await this.assertSubscriptionExists(workspaceId, subscriptionId);
    const payment = await this.repository.softDelete(workspaceId, id);
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  private async assertSubscriptionExists(
    workspaceId: string,
    subscriptionId: string,
  ) {
    const sub = await this.subscriptionsRepository.findOne(
      workspaceId,
      subscriptionId,
    );
    if (!sub) {
      throw new BadRequestException(
        `Subscription ${subscriptionId} not found in workspace`,
      );
    }
  }
}
