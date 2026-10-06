import crypto from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientsService } from '../clients/clients.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { Project, ProjectDocument } from './projects.schema';
import { Task, TaskDocument } from '../tasks/tasks.schema';
import { Invoice, InvoiceDocument } from '../invoices/invoices.schema';
import { Quote, QuoteDocument } from '../quotes/quotes.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '../subscriptions/subscriptions.schema';
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
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
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
    const project = await this.projectsRepository.update(workspaceId, id, dto);
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

    const [tasks, invoices, documents, quotes, subscriptions, timeEntries] =
      await Promise.all([
        this.taskModel
          .find({ workspaceId, projectId: id, isDeleted: false })
          .sort({ createdAt: -1 })
          .lean()
          .exec(),
        this.invoiceModel
          .find({ workspaceId, projectId: id, isDeleted: false })
          .sort({ createdAt: -1 })
          .lean()
          .exec(),
        this.documentModel
          .find({ workspaceId, projectId: id, isDeleted: false })
          .sort({ createdAt: -1 })
          .lean()
          .exec(),
        this.quoteModel
          .find({ workspaceId, projectId: id, isDeleted: false })
          .sort({ createdAt: -1 })
          .lean()
          .exec(),
        // Retainers/cuotas belong to the client — surface them on every
        // project of that client so totals stay linked.
        this.subscriptionModel
          .find({
            workspaceId,
            clientId: (project as any).clientId,
            isDeleted: false,
          })
          .sort({ createdAt: -1 })
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
      paid: invoices
        .filter((i) => i.status === 'paid' || i.status === 'collected')
        .reduce((sum, i) => sum + (i.total ?? 0), 0),
      pending: invoices
        .filter((i) => i.status === 'pending' || i.status === 'sent')
        .reduce((sum, i) => sum + (i.total ?? 0), 0),
      overdue: invoices
        .filter((i) => i.status === 'overdue')
        .reduce((sum, i) => sum + (i.total ?? 0), 0),
    };

    const quoteStats = {
      total: quotes.length,
      quoted: quotes
        .filter((q) => q.status === 'sent' || q.status === 'accepted')
        .reduce((sum, q) => sum + (q.total ?? 0), 0),
      accepted: quotes
        .filter((q) => q.status === 'accepted')
        .reduce((sum, q) => sum + (q.total ?? 0), 0),
    };

    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === 'active',
    );
    const subscriptionStats = {
      total: subscriptions.length,
      active: activeSubscriptions.length,
      // Normalized monthly recurring revenue across billing cycles.
      monthlyRecurring: activeSubscriptions.reduce(
        (sum, s) =>
          sum +
          (s.price ?? 0) * (s.billingCycle === 'yearly' ? 1 / 12 : 1),
        0,
      ),
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
      quoteStats,
      subscriptionStats,
      timeStats,
      recentTasks: tasks.slice(0, 5),
      pendingTasks: tasks
        .filter((t) => t.status !== 'done' && t.status !== 'cancelled')
        .slice(0, 10),
      invoices,
      quotes,
      subscriptions,
      documents,
    };
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
