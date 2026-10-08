import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientsService } from '../clients/clients.service';
import { InvoicesService } from '../invoices/invoices.service';
import { normalizeCalendarDate, todayNoonUTC } from '../../common/utils/dates';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { Project, ProjectDocument } from './projects.schema';
import { Task, TaskDocument } from '../tasks/tasks.schema';
import { Invoice, InvoiceDocument } from '../invoices/invoices.schema';
import {
  TimeEntry,
  TimeEntryDocument,
} from '../time-tracking/time-tracking.schema';
import { Document as DocModel, DocumentDocument } from '../docs/docs.schema';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly clientsService: ClientsService,
    @Inject(forwardRef(() => InvoicesService))
    private readonly invoicesService: InvoicesService,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(TimeEntry.name)
    private readonly timeEntryModel: Model<TimeEntryDocument>,
    @InjectModel(DocModel.name)
    private readonly documentModel: Model<DocumentDocument>,
  ) {}

  findAll(workspaceId: string, query: QueryProjectDto) {
    const { page, limit, search, status, clientId } = query;
    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (clientId) filters.clientId = clientId;
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return this.projectsRepository.findAll(workspaceId, filters, {
      page,
      limit,
    });
  }

  async findOne(workspaceId: string, id: string) {
    const project = await this.projectsRepository.findOne(workspaceId, id);
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async create(workspaceId: string, dto: CreateProjectDto) {
    await this.validateClient(workspaceId, dto.clientId);
    const patch: Record<string, any> = { ...dto };
    for (const key of ['startDate', 'endDate'] as const) {
      if ((dto as any)[key] !== undefined) {
        const normalized = normalizeCalendarDate((dto as any)[key]);
        if (normalized) patch[key] = normalized;
      }
    }
    return this.projectsRepository.create(workspaceId, patch);
  }

  async update(workspaceId: string, id: string, dto: UpdateProjectDto) {
    if (dto.clientId !== undefined) {
      await this.validateClient(workspaceId, dto.clientId);
    }
    // Fecha de fin real: se fija al completar el proyecto y se limpia si se reabre.
    const patch: Record<string, any> = { ...dto };
    if ((dto as any).status !== undefined) {
      patch.actualEndDate =
        (dto as any).status === 'completed' ? todayNoonUTC() : null;
    }
    for (const key of ['startDate', 'endDate'] as const) {
      if ((dto as any)[key] !== undefined) {
        const normalized = normalizeCalendarDate((dto as any)[key]);
        if (normalized) patch[key] = normalized;
      }
    }
    const project = await this.projectsRepository.update(workspaceId, id, patch);
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async remove(workspaceId: string, id: string) {
    const project = await this.projectsRepository.softDelete(workspaceId, id);
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async findDemo(workspaceId: string) {
    return this.projectsRepository.findAll(
      workspaceId,
      { isDemo: true },
      { limit: 100 },
    );
  }

  async getOverview(workspaceId: string, id: string) {
    const project = await this.projectsRepository.findOne(workspaceId, id);
    if (!project) throw new NotFoundException(`Project ${id} not found`);

    // Lists are capped so the detail view stays fast as data grows;
    // totals always cover the full dataset.
    const [tasks, invoices, documents, timeEntries] = await Promise.all([
      this.taskModel
        .find({ workspaceId, projectId: id, isDeleted: false })
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.invoiceModel
        .find({ workspaceId, projectId: id, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(25)
        .lean()
        .exec(),
      this.documentModel
        .find({ workspaceId, projectId: id, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(25)
        .lean()
        .exec(),
      this.timeEntryModel
        .find({ workspaceId, projectId: id, isDeleted: false })
        .lean()
        .exec(),
    ]);

    const now = new Date();

    const taskStats = {
      total: tasks.length,
      done: tasks.filter((t) => t.status === 'done').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      cancelled: tasks.filter((t) => t.status === 'cancelled').length,
      overdue: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < now &&
          t.status !== 'done' &&
          t.status !== 'cancelled',
      ).length,
    };

    const isInstallmentsPlan =
      (project as any)?.billingType === 'installments';
    const isInstallmentInvoice = (i: any) =>
      i.installmentNumber != null || i.installmentCount != null;
    // Invoices generated from a billing plan always carry installment
    // markers, but invoices created manually (or by older versions) may not.
    // In that case fall back to every invoice of an installments project so
    // the counters never show 0 while invoices exist.
    let installmentInvoices = invoices.filter(isInstallmentInvoice);
    if (isInstallmentsPlan && installmentInvoices.length === 0) {
      installmentInvoices = invoices.filter(
        (i) => i.status !== 'cancelled' && i.status !== 'draft',
      );
    }
    const installmentPendingStatuses = ['pending', 'sent', 'overdue'];

    const invoiceStats = {
      total: invoices.length,
      agreed: invoices
        .filter((i) => i.status !== 'cancelled' && i.status !== 'draft')
        .reduce((sum, i) => sum + (i.total ?? 0), 0),
      paid: invoices
        .filter((i) => i.status === 'paid' || i.status === 'collected')
        .reduce((sum, i) => sum + (i.total ?? 0), 0),
      pending: invoices
        .filter((i) => i.status === 'pending' || i.status === 'sent')
        .reduce((sum, i) => sum + (i.total ?? 0), 0),
      overdue: invoices
        .filter((i) => i.status === 'overdue')
        .reduce((sum, i) => sum + (i.total ?? 0), 0),
      installmentsTotal: installmentInvoices.length,
      installmentsPending: installmentInvoices.filter((i) =>
        installmentPendingStatuses.includes(i.status),
      ).length,
      nextDueDate: invoices
        .filter(
          (i) =>
            (i.status === 'pending' || i.status === 'sent' || i.status === 'overdue') &&
            i.dueDate,
        )
        .map((i) => new Date(i.dueDate as any).getTime())
        .sort((a, b) => a - b)
        .map((t) => new Date(t).toISOString())[0] ?? null,
    };

    const billableEntries = timeEntries.filter((t) => t.billable);
    const timeStats = {
      totalMinutes: timeEntries.reduce((sum, t) => sum + (t.duration ?? 0), 0),
      billableMinutes: billableEntries.reduce(
        (sum, t) => sum + (t.duration ?? 0),
        0,
      ),
      billableAmount: billableEntries.reduce(
        (sum, t) => sum + ((t.duration ?? 0) / 60) * (t.hourlyRate ?? 0),
        0,
      ),
    };

    return {
      project,
      taskStats,
      invoiceStats,
      timeStats,
      recentTasks: tasks.slice(0, 5),
      pendingTasks: tasks
        .filter((t) => t.status !== 'done' && t.status !== 'cancelled')
        .slice(0, 10),
      invoices,
      documents,
    };
  }

  async generateInvoices(workspaceId: string, id: string) {
    const project = await this.projectsRepository.findOne(workspaceId, id);
    if (!project) throw new NotFoundException(`Project ${id} not found`);

    if ((project as any).billingType !== 'installments') {
      throw new BadRequestException(
        'El proyecto no está configurado en cuotas (billingType debe ser installments).',
      );
    }
    const count = (project as any).installmentsCount ?? 0;
    if (count < 2 || count > 60) {
      throw new BadRequestException(
        'Configurá entre 2 y 60 cuotas en el proyecto antes de generar las facturas.',
      );
    }
    if (!((project as any).budget > 0)) {
      throw new BadRequestException(
        'El proyecto necesita un presupuesto mayor a 0 para generar las cuotas.',
      );
    }

    const alreadyGenerated = await this.invoiceModel.countDocuments({
      workspaceId,
      projectId: id,
      isDeleted: false,
      $or: [
        { installmentCount: { $ne: null } },
        { installmentNumber: { $ne: null } },
        // Invoices created manually (or by older versions) carry no
        // installment markers — treat any live invoice as already generated
        // so running this twice never duplicates the billing plan.
        { status: { $nin: ['cancelled', 'draft'] } },
      ],
    } as any);
    if (alreadyGenerated > 0) {
      throw new ConflictException(
        'Este proyecto ya tiene facturas de cuotas generadas.',
      );
    }

    const budget = (project as any).budget as number;
    const currency = (project as any).currency ?? 'USD';
    const baseDate = (project as any).startDate
      ? new Date((project as any).startDate)
      : new Date();
    const year = new Date().getFullYear();
    const shortId = (project._id as any).toString().slice(-6).toUpperCase();

    // Equal split in cents so rounding never loses money; last quota absorbs the remainder.
    const totalCents = Math.round(budget * 100);
    const perCents = Math.floor(totalCents / count);

    const created: unknown[] = [];
    for (let i = 1; i <= count; i++) {
      const cents = i === count ? totalCents - perCents * (count - 1) : perCents;
      const amount = cents / 100;
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      const invoice = await this.invoicesService.create(workspaceId, {
        number: `C${year}-${shortId}-${i}/${count}`,
        clientId: (project as any).clientId,
        projectId: id,
        type: 'income',
        status: 'pending',
        issueDate: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        currency,
        items: [
          {
            description: `Cuota ${i}/${count} — ${(project as any).name}`,
            quantity: 1,
            unitPrice: amount,
            amount,
          },
        ],
        installmentNumber: i,
        installmentCount: count,
      } as any);
      created.push(invoice);
    }

    return { generated: created.length, invoices: created };
  }

  private async validateClient(workspaceId: string, clientId?: string) {
    if (!clientId) return;
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
