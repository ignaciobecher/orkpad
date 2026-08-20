import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './notifications.schema';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { Task, TaskDocument } from '../tasks/tasks.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '../subscriptions/subscriptions.schema';
import { Workspace, WorkspaceDocument } from '../workspaces/workspaces.schema';
import { Invoice, InvoiceDocument } from '../invoices/invoices.schema';
import {
  WorkSession,
  WorkSessionDocument,
} from '../work-sessions/work-sessions.schema';
import { Deal, DealDocument } from '../pipeline/pipeline.schema';

@Injectable()
export class NotificationsCronService {
  private readonly logger = new Logger(NotificationsCronService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(WorkSession.name)
    private readonly workSessionModel: Model<WorkSessionDocument>,
    @InjectModel(Deal.name) private readonly dealModel: Model<DealDocument>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCron() {
    this.logger.log('Starting daily automated notification checks...');
    await this.cleanupOldDailyRecaps();
    const workspaces = await this.workspaceModel
      .find({ isDeleted: false, status: 'active' })
      .exec();

    for (const workspace of workspaces) {
      const workspaceId = workspace._id.toString();
      const ownerId = workspace.ownerId;

      await Promise.all([
        this.checkProjectDeadlines(workspaceId, ownerId),
        this.checkTaskDeadlines(workspaceId, ownerId),
        this.checkSubscriptionRenewals(workspaceId, ownerId),
        this.checkOverdueInvoices(workspaceId, ownerId),
        this.checkStalledDeals(workspaceId, ownerId),
      ]);
    }
    this.logger.log('Daily automated notification checks completed.');
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyRecap() {
    this.logger.log('Generating daily recaps...');
    const workspaces = await this.workspaceModel
      .find({ isDeleted: false, status: 'active' })
      .exec();
    for (const workspace of workspaces) {
      await this.generateDailyRecap(
        workspace._id.toString(),
        workspace.ownerId,
      );
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyCron() {
    this.logger.log('Starting hourly automated notification checks...');
    const workspaces = await this.workspaceModel
      .find({ isDeleted: false, status: 'active' })
      .exec();
    for (const workspace of workspaces) {
      await this.checkLongRunningSessions(workspace._id.toString());
    }
  }

  private async cleanupOldDailyRecaps() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    await this.notificationModel
      .updateMany(
        {
          refType: 'daily_recap',
          isDeleted: false,
          createdAt: { $lt: yesterday },
        },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      )
      .exec();
    this.logger.debug('Old daily recap notifications cleaned up.');
  }

  private async generateDailyRecap(workspaceId: string, userId: string) {
    await this.notificationModel
      .updateMany(
        { workspaceId, userId, refType: 'daily_recap', isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      )
      .exec();

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [tasks, projects, invoices] = await Promise.all([
      this.taskModel.countDocuments({
        workspaceId,
        isDeleted: false,
        status: { $ne: 'done' },
        dueDate: { $gte: startOfDay, $lte: endOfDay },
      }),
      this.projectModel.countDocuments({
        workspaceId,
        isDeleted: false,
        endDate: { $gte: startOfDay, $lte: endOfDay },
      }),
      this.invoiceModel.countDocuments({
        workspaceId,
        isDeleted: false,
        status: { $ne: 'paid' },
        dueDate: { $gte: startOfDay, $lte: endOfDay },
      }),
    ]);

    if (tasks > 0 || projects > 0 || invoices > 0) {
      let message = 'Hoy tienes: ';
      const parts: string[] = [];
      if (tasks > 0)
        parts.push(`${tasks} ${tasks === 1 ? 'tarea' : 'tareas'} por vencer`);
      if (projects > 0)
        parts.push(
          `${projects} ${projects === 1 ? 'proyecto que finaliza' : 'proyectos que finalizan'}`,
        );
      if (invoices > 0)
        parts.push(
          `${invoices} ${invoices === 1 ? 'factura que vence' : 'facturas que vencen'}`,
        );

      message += parts.join(', ') + '.';

      // Reference includes the date string for idempotency per day
      const dateKey = startOfDay.toISOString().split('T')[0];

      await this.createNotificationIfNotExist(workspaceId, userId, {
        title: 'Resumen del día',
        message,
        type: 'info',
        link: `/app/dashboard`,
        refId: dateKey,
        refType: 'daily_recap',
      });
    }
  }

  private async checkProjectDeadlines(workspaceId: string, userId: string) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const projects = await this.projectModel
      .find({
        workspaceId,
        isDeleted: false,
        status: 'active',
        endDate: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();

    for (const project of projects) {
      await this.createNotificationIfNotExist(workspaceId, userId, {
        title: 'Fecha límite de proyecto',
        message: `El proyecto "${project.name}" finaliza en 7 días.`,
        type: 'warning',
        link: `/app/projects`,
        refId: project._id.toString(),
        refType: 'project_deadline_7d',
      });
    }
  }

  private async checkTaskDeadlines(workspaceId: string, userId: string) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const tasks = await this.taskModel
      .find({
        workspaceId,
        isDeleted: false,
        status: { $ne: 'done' },
        dueDate: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();

    for (const task of tasks) {
      await this.createNotificationIfNotExist(workspaceId, userId, {
        title: 'Tarea próxima a vencer',
        message: `La tarea "${task.title}" vence en 7 días.`,
        type: 'info',
        link: `/app/tasks`,
        refId: task._id.toString(),
        refType: 'task_deadline_7d',
      });
    }
  }

  private async checkSubscriptionRenewals(workspaceId: string, userId: string) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const subscriptions = await this.subscriptionModel
      .find({
        workspaceId,
        isDeleted: false,
        status: 'active',
        nextBillingDate: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();

    for (const sub of subscriptions) {
      await this.createNotificationIfNotExist(workspaceId, userId, {
        title: 'Renovación de suscripción',
        message: `La suscripción "${sub.planName}" se renovará en 3 días.`,
        type: 'warning',
        link: `/app/subscriptions`,
        refId: sub._id.toString(),
        refType: 'subscription_renewal_3d',
      });
    }
  }

  private async checkOverdueInvoices(workspaceId: string, userId: string) {
    const now = new Date();
    const invoices = await this.invoiceModel
      .find({
        workspaceId,
        isDeleted: false,
        status: { $nin: ['paid', 'cancelled'] },
        dueDate: { $lt: now },
      })
      .exec();

    for (const inv of invoices) {
      await this.createNotificationIfNotExist(workspaceId, userId, {
        title: 'Factura vencida',
        message: `La factura ${inv.number || inv._id} está vencida.`,
        type: 'error',
        link: `/app/finance`,
        refId: inv._id.toString(),
        refType: 'invoice_overdue',
      });
    }
  }

  private async checkStalledDeals(workspaceId: string, userId: string) {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const stalledDeals = await this.dealModel
      .find({
        workspaceId,
        isDeleted: false,
        stage: { $nin: ['won', 'lost'] },
        updatedAt: { $lt: fifteenDaysAgo },
      })
      .exec();

    for (const deal of stalledDeals) {
      await this.createNotificationIfNotExist(workspaceId, userId, {
        title: 'Trato estancado',
        message: `El trato "${deal.title}" no ha tenido actividad en 15 días.`,
        type: 'warning',
        link: `/app/pipeline`,
        refId: deal._id.toString(),
        refType: 'deal_stalled_15d',
      });
    }
  }

  private async checkLongRunningSessions(workspaceId: string) {
    const eightHoursAgo = new Date();
    eightHoursAgo.setHours(eightHoursAgo.getHours() - 8);

    const activeSessions = await this.workSessionModel
      .find({
        workspaceId,
        isDeleted: false,
        endTime: null,
        startTime: { $lt: eightHoursAgo },
      })
      .exec();

    for (const session of activeSessions) {
      await this.createNotificationIfNotExist(workspaceId, session.userId, {
        title: 'Sesión prolongada',
        message: `Tu sesión de trabajo lleva más de 8 horas activa. ¿Olvidaste detenerla?`,
        type: 'warning',
        link: `/app/time-tracking`,
        refId: session._id.toString(),
        refType: 'session_long_running',
      });
    }
  }

  private async createNotificationIfNotExist(
    workspaceId: string,
    userId: string,
    data: any,
  ) {
    const exists = await this.notificationModel
      .findOne({
        workspaceId,
        userId,
        refId: data.refId,
        refType: data.refType,
        isDeleted: false,
      })
      .exec();

    if (!exists) {
      await this.notificationModel.create({
        ...data,
        workspaceId,
        userId,
        isRead: false,
      });
      this.logger.debug(
        `Notification created for ${data.refType} on entity ${data.refId}`,
      );
    }
  }
}
