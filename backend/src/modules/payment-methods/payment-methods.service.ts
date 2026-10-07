import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethodsRepository } from './payment-methods.repository';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

const DEFAULT_METHODS = [
  'Transferencia',
  'Efectivo',
  'Tarjeta de débito',
  'Tarjeta de crédito',
  'Mercado Pago',
  'PayPal',
];

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly repository: PaymentMethodsRepository) {}

  async findAll(workspaceId: string, activeOnly?: boolean) {
    await this.ensureDefaults(workspaceId);
    const filters: Record<string, any> = {};
    if (activeOnly !== undefined) filters.active = activeOnly;
    const result = await this.repository.findAll(workspaceId, filters, {
      sort: { name: 1 },
    } as any);
    return result;
  }

  async create(workspaceId: string, dto: CreatePaymentMethodDto) {
    try {
      return await this.repository.create(workspaceId, {
        ...dto,
        active: dto.active ?? true,
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Ya existe ese método de pago.');
      }
      throw err;
    }
  }

  async update(
    workspaceId: string,
    id: string,
    dto: UpdatePaymentMethodDto,
  ) {
    try {
      const item = await this.repository.update(workspaceId, id, dto);
      if (!item) throw new NotFoundException(`Payment method ${id} not found`);
      return item;
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Ya existe ese método de pago.');
      }
      throw err;
    }
  }

  async remove(workspaceId: string, id: string) {
    const item = await this.repository.softDelete(workspaceId, id);
    if (!item) throw new NotFoundException(`Payment method ${id} not found`);
    return item;
  }

  /** First use seeds the catalog so selects are never empty. Idempotent. */
  private async ensureDefaults(workspaceId: string): Promise<void> {
    const existing = await this.repository.findAll(
      workspaceId,
      {},
      { limit: 1 } as any,
    );
    if (existing.total > 0) return;
    await Promise.all(
      DEFAULT_METHODS.map((name) =>
        this.repository.create(workspaceId, { name, active: true }),
      ),
    );
  }
}
