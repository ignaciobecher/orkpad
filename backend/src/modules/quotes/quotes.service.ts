import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { ProjectsService } from '../projects/projects.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { normalizeCalendarDate } from '../../common/utils/dates';
import { InvoicesService } from '../invoices/invoices.service';
import { QuotesRepository } from './quotes.repository';
import { QuotesPdfService } from './quotes-pdf.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QueryQuoteDto } from './dto/query-quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    private readonly quotesRepository: QuotesRepository,
    private readonly quotesPdfService: QuotesPdfService,
    private readonly clientsService: ClientsService,
    private readonly projectsService: ProjectsService,
    private readonly invoicesService: InvoicesService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  findAll(workspaceId: string, query: QueryQuoteDto) {
    const { page, limit, search, status, clientId, projectId } = query;
    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (clientId) filters.clientId = clientId;
    if (projectId) filters.projectId = projectId;
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { number: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
      ];
    }
    return this.quotesRepository.findAll(workspaceId, filters, { page, limit });
  }

  async findOne(workspaceId: string, id: string) {
    const quote = await this.quotesRepository.findOne(workspaceId, id);
    if (!quote) throw new NotFoundException(`Quote ${id} not found`);
    return quote;
  }

  async create(workspaceId: string, dto: CreateQuoteDto) {
    await this.validateRelations(workspaceId, dto.clientId, dto.projectId);
    const computed = this.computeTotals(dto);
    const patch: Record<string, any> = { ...dto, ...computed };
    // Snapshot de datos de la agencia: lo que falte se completa con la
    // marca configurada para que el presupuesto salga con membrete.
    const ws = await this.workspacesService.findById(workspaceId).catch(() => null);
    const brand = ws as any;
    if (brand) {
      const fill: Record<string, any> = {
        freelancerName: brand.displayName ?? brand.name,
        freelancerEmail: brand.agencyEmail,
        freelancerPhone: brand.agencyPhone,
        freelancerAddress: brand.agencyAddress,
        freelancerWebsite: brand.agencyWebsite,
        freelancerTaxId: brand.taxId,
        agencyLogoFileId: brand.logoFileId,
      };
      for (const [k, v] of Object.entries(fill)) {
        if ((patch[k] === undefined || patch[k] === '') && v) patch[k] = v;
      }
    }
    for (const key of ['issueDate', 'expiresAt'] as const) {
      if ((dto as any)[key] !== undefined) {
        const normalized = normalizeCalendarDate((dto as any)[key]);
        if (normalized) patch[key] = normalized;
      }
    }
    return this.quotesRepository.create(workspaceId, patch);
  }

  async update(workspaceId: string, id: string, dto: UpdateQuoteDto) {
    await this.validateRelations(workspaceId, dto.clientId, dto.projectId);
    const current = await this.findOne(workspaceId, id);
    const merged = { ...current.toObject(), ...dto };
    const computed = this.computeTotals(merged);
    const patch: Record<string, any> = { ...dto, ...computed };
    for (const key of ['issueDate', 'expiresAt'] as const) {
      if ((dto as any)[key] !== undefined) {
        const normalized = normalizeCalendarDate((dto as any)[key]);
        if (normalized) patch[key] = normalized;
      }
    }
    const quote = await this.quotesRepository.update(workspaceId, id, patch);
    if (!quote) throw new NotFoundException(`Quote ${id} not found`);
    return quote;
  }

  async remove(workspaceId: string, id: string) {
    const quote = await this.quotesRepository.softDelete(workspaceId, id);
    if (!quote) throw new NotFoundException(`Quote ${id} not found`);
    return quote;
  }

  async findDemo(workspaceId: string) {
    return this.quotesRepository.findAll(
      workspaceId,
      { isDemo: true },
      { limit: 100 },
    );
  }

  async generatePdf(workspaceId: string, id: string): Promise<Buffer> {
    const quote = await this.findOne(workspaceId, id);
    return this.quotesPdfService.generate(quote);
  }

  async convertToInvoice(workspaceId: string, id: string) {
    const quote = await this.findOne(workspaceId, id);
    if (quote.status !== 'accepted') {
      throw new BadRequestException(
        'Solo las cotizaciones aceptadas pueden convertirse en factura',
      );
    }

    const items = quote.sections?.length
      ? quote.sections.flatMap((s) =>
          (s.items || []).map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        )
      : (quote.items || []).map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        }));

    return this.invoicesService.create(workspaceId, {
      type: 'income',
      status: 'draft',
      clientId: quote.clientId,
      projectId: quote.projectId,
      currency: quote.currency,
      taxRate: quote.taxRate,
      notes: quote.notes,
      issueDate: new Date().toISOString(),
      items,
    });
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
  }

  private computeTotals(dto: any): {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
  } {
    let subtotal = 0;

    if (dto.sections?.length) {
      subtotal = dto.sections
        .flatMap((s: any) => s.items || [])
        .reduce((sum: number, item: any) => sum + (item.amount ?? 0), 0);
    } else if (dto.items?.length) {
      subtotal = dto.items.reduce(
        (sum: number, item: any) => sum + (item.amount ?? 0),
        0,
      );
    }

    const discountAmount = subtotal * ((dto.discountPercent ?? 0) / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = Math.round(taxableAmount * ((dto.taxRate ?? 0) / 100));
    const total = taxableAmount + taxAmount;

    return { subtotal, taxAmount, discountAmount, total };
  }
}
