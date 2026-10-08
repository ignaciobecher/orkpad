import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { normalizeCalendarDate } from '../../common/utils/dates';
import { ClientsService } from '../clients/clients.service';
import { ProjectsService } from '../projects/projects.service';
import { InvoicesRepository } from './invoices.repository';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly clientsService: ClientsService,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
  ) {}

  findAll(workspaceId: string, query: QueryInvoiceDto) {
    const { page, limit, search, status, type, clientId, projectId } = query;
    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (clientId) filters.clientId = clientId;
    if (projectId) filters.projectId = projectId;
    if (search) {
      filters.$or = [
        { number: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }
    return this.invoicesRepository.findAll(workspaceId, filters, {
      page,
      limit,
    });
  }

  async findOne(workspaceId: string, id: string) {
    const invoice = await this.invoicesRepository.findOne(workspaceId, id);
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  create(workspaceId: string, dto: CreateInvoiceDto) {
    return this.createValidated(workspaceId, dto);
  }

  private async createValidated(workspaceId: string, dto: CreateInvoiceDto) {
    if (dto.clientId) {
      await this.validateRelations(workspaceId, dto.clientId, dto.projectId);
    }

    const hasItems = (dto.items?.length ?? 0) > 0;
    const computed = this.computeTotals(dto.items ?? [], dto.taxRate ?? 0);

    const total = hasItems ? computed.total : (dto.total ?? 0);
    const subtotal = hasItems ? computed.subtotal : (dto.total ?? 0);

    const dates: Record<string, any> = {};
    const issueDate = normalizeCalendarDate((dto as any).issueDate);
    const dueDate = normalizeCalendarDate((dto as any).dueDate);
    const paidDate = normalizeCalendarDate((dto as any).paidDate);
    if (issueDate) dates.issueDate = issueDate;
    if (dueDate) dates.dueDate = dueDate;
    if (paidDate) dates.paidDate = paidDate;

    try {
      return await this.invoicesRepository.create(workspaceId, {
        ...dto,
        ...dates,
        subtotal,
        taxAmount: hasItems ? computed.taxAmount : 0,
        total,
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Ya existe una factura con ese número.');
      }
      throw err;
    }
  }

  async update(workspaceId: string, id: string, dto: UpdateInvoiceDto) {
    const current = await this.findOne(workspaceId, id);
    if (dto.clientId || current.clientId) {
      await this.validateRelations(
        workspaceId,
        dto.clientId ?? current.clientId,
        dto.projectId ?? current.projectId,
      );
    }

    const extra: Record<string, any> = {};
    const items = dto.items ?? current.items;
    const taxRate = dto.taxRate ?? current.taxRate;

    if (items?.length) {
      Object.assign(extra, this.computeTotals(items as any, taxRate));
    } else if (dto.total !== undefined) {
      extra.total = dto.total;
      extra.subtotal = dto.total;
      extra.taxAmount = 0;
    }

    for (const key of ['issueDate', 'dueDate', 'paidDate'] as const) {
      if ((dto as any)[key] !== undefined) {
        const normalized = normalizeCalendarDate((dto as any)[key]);
        if (normalized) extra[key] = normalized;
      }
    }

    let invoice;
    try {
      invoice = await this.invoicesRepository.update(workspaceId, id, {
        ...dto,
        ...extra,
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Ya existe una factura con ese número.');
      }
      throw err;
    }
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async remove(workspaceId: string, id: string) {
    const invoice = await this.invoicesRepository.softDelete(workspaceId, id);
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  private async validateRelations(
    workspaceId: string,
    clientId?: string,
    projectId?: string,
  ) {
    if (!clientId) return;

    const client = await this.clientsService
      .findOne(workspaceId, clientId)
      .catch(() => null);
    if (!client) {
      throw new BadRequestException(
        'clientId must reference an existing client in the workspace',
      );
    }

    if (!projectId) return;

    const project = await this.projectsService
      .findOne(workspaceId, projectId)
      .catch(() => null);
    if (!project) {
      throw new BadRequestException(
        'projectId must reference an existing project in the workspace',
      );
    }

    if (project.clientId && project.clientId !== clientId) {
      throw new BadRequestException(
        'projectId must belong to the selected clientId',
      );
    }
  }

  private computeTotals(
    items: { amount: number }[],
    taxRate: number,
  ): { subtotal: number; taxAmount: number; total: number } {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Math.round(subtotal * (taxRate / 100));
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }
}
