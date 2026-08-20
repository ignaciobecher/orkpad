import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionPaymentsRepository } from './subscription-payments.repository';
import { SubscriptionsRepository } from './subscriptions.repository';
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';
import { UpdateSubscriptionPaymentDto } from './dto/update-subscription-payment.dto';

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
    return this.repository.create(workspaceId, {
      ...dto,
      subscriptionId,
      status: 'pending',
    });
  }

  async markPaid(workspaceId: string, subscriptionId: string, id: string) {
    await this.assertSubscriptionExists(workspaceId, subscriptionId);
    const payment = await this.repository.update(workspaceId, id, {
      status: 'paid',
      paidAt: new Date(),
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
    const payment = await this.repository.update(workspaceId, id, dto);
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
