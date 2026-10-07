import crypto from 'crypto';
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
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { InvoicesService } from '../invoices/invoices.service';
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
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
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
    return this.projectsRepository.create(workspaceId, dto);
  }

  async update(workspaceId: string, id: string, dto: UpdateProjectDto) {
    if (dto.clientId !== undefined) {
      await this.validateClient(workspaceId, dto.clientId);
    }
    // Fecha de fin real: se fija al completar el proyecto y se limpia si se reabre.
    const patch: Record<string, any> = { ...dto };
    if ((dto as any).status !== undefined) {
      patch.actualEndDate = (dto as any).status === 'completed' ? new Date() : null;
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
      installmentsTotal: invoices.filter((i) => i.installmentCount).length,
      installmentsPending: invoices.filter(
        (i) =>
          i.installmentCount &&
          (i.status === 'pending' || i.status === 'sent' || i.status === 'overdue'),
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
      installmentCount: { $ne: null },
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

  async generatePublicLink(
    workspaceId: string,
    id: string,
  ): Promise<{ publicToken: string }> {
    const project = await this.projectsRepository.findOne(workspaceId, id);
    if (!project) throw new NotFoundException(`Project ${id} not found`);

    const publicToken = crypto.randomBytes(32).toString('hex');
    await this.projectModel
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $set: { publicToken } },
      )
      .exec();

    return { publicToken };
  }

  async revokePublicLink(
    workspaceId: string,
    id: string,
  ): Promise<{ success: boolean }> {
    const project = await this.projectsRepository.findOne(workspaceId, id);
    if (!project) throw new NotFoundException(`Project ${id} not found`);

    await this.projectModel
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $set: { publicToken: null } },
      )
      .exec();

    return { success: true };
  }

  async getPublicView(token: string) {
    const project = await this.projectModel
      .findOne({ publicToken: token, isDeleted: false })
      .lean()
      .exec();

    if (!project) throw new NotFoundException('Link inválido o revocado');

    const projectId = (project._id as any).toString();

    const [tasks, invoices, documents] = await Promise.all([
      this.taskModel
        .find({ workspaceId: project.workspaceId, projectId, isDeleted: false })
        .lean()
        .exec(),
      this.invoiceModel
        .find({ workspaceId: project.workspaceId, projectId, isDeleted: false })
        .lean()
        .exec(),
      this.documentModel
        .find({ workspaceId: project.workspaceId, projectId, isDeleted: false })
        .lean()
        .exec(),
    ]);

    const now = new Date();
    const taskStats = {
      total: tasks.length,
      done: tasks.filter((t) => t.status === 'done').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      overdue: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < now &&
          t.status !== 'done' &&
          t.status !== 'cancelled',
      ).length,
    };

    const paid = invoices
      .filter((i) => i.status === 'paid' || i.status === 'collected')
      .reduce((sum, i) => sum + (i.total ?? 0), 0);
    const pending = invoices
      .filter((i) => i.status === 'pending' || i.status === 'sent')
      .reduce((sum, i) => sum + (i.total ?? 0), 0);

    return {
      id: project._id,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
      currency: project.currency,
      taskStats,
      invoiceStats: { paid, pending, currency: project.currency },
      tasks: tasks.map((t) => ({
        id: t._id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
      })),
      invoices: invoices.map((i) => ({
        id: i._id,
        number: i.number,
        status: i.status,
        total: i.total,
        dueDate: i.dueDate,
        issueDate: i.issueDate,
      })),
      documents: documents.map((d) => ({
        id: d._id,
        title: d.title,
        createdAt: (d as any).createdAt,
      })),
    };
  }

  async createPublicTask(
    token: string,
    dto: { title: string; description?: string },
  ) {
    const project = await this.projectModel
      .findOne({ publicToken: token, isDeleted: false })
      .lean()
      .exec();

    if (!project) throw new NotFoundException('Link inválido o revocado');

    const task = new this.taskModel({
      ...dto,
      workspaceId: project.workspaceId,
      projectId: (project._id as any).toString(),
      status: 'todo',
      priority: 'medium',
      isDeleted: false,
    });

    const savedTask = await task.save();

    this.notifyWorkspaceOnPublicTask(
      project.workspaceId,
      (project._id as any).toString(),
      (project as any).name,
      savedTask._id.toString(),
      dto.title,
    ).catch(() => {});

    return savedTask;
  }

  private async notifyWorkspaceOnPublicTask(
    workspaceId: string,
    projectId: string,
    projectName: string,
    taskId: string,
    taskTitle: string,
  ): Promise<void> {
    const { data: users } = await this.usersService.findAllByWorkspace(
      workspaceId,
      { limit: 100 },
    );

    await Promise.allSettled(
      users
        .filter((u) => u.notificationPreferences?.publicTaskCreated !== false)
        .map((u) =>
          this.notificationsService.create(workspaceId, {
            userId: (u._id as any).toString(),
            title: 'Nueva tarea de cliente',
            message: `Tu cliente agregó "${taskTitle}" en el proyecto "${projectName}"`,
            type: 'info',
            link: `/projects/${projectId}`,
            refId: taskId,
            refType: 'task',
          }),
        ),
    );
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
