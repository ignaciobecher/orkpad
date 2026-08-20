import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { ProductsService } from '../products/products.service';
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
    private readonly productsService: ProductsService,
  ) {}

  async findAll(workspaceId: string, query: QuerySubscriptionDto) {
    const { search, clientId, productId, status, page, limit } = query;
    const filters: Record<string, any> = {};
    if (clientId) filters.clientId = clientId;
    if (productId) filters.productId = productId;
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
    await this.validateRelations(workspaceId, dto.clientId, dto.productId);
    return this.repository.create(workspaceId, dto);
  }

  async update(workspaceId: string, id: string, dto: UpdateSubscriptionDto) {
    if (dto.clientId !== undefined || dto.productId !== undefined) {
      const current = await this.findOne(workspaceId, id);
      await this.validateRelations(
        workspaceId,
        dto.clientId ?? current.clientId,
        dto.productId ?? current.productId,
      );
    }
    const item = await this.repository.update(workspaceId, id, dto);
    if (!item) throw new NotFoundException(`Subscription ${id} not found`);
    return item;
  }

  async remove(workspaceId: string, id: string) {
    const item = await this.repository.softDelete(workspaceId, id);
    if (!item) throw new NotFoundException(`Subscription ${id} not found`);
    return item;
  }

  private async validateRelations(
    workspaceId: string,
    clientId: string,
    productId?: string,
  ) {
    const client = await this.clientsService
      .findOne(workspaceId, clientId)
      .catch(() => null);
    if (!client) {
      throw new BadRequestException(
        'clientId must reference an existing client in the workspace',
      );
    }

    if (!productId) return;

    const product = await this.productsService
      .findOne(workspaceId, productId)
      .catch(() => null);
    if (!product) {
      throw new BadRequestException(
        'productId must reference an existing product in the workspace',
      );
    }
  }
}
