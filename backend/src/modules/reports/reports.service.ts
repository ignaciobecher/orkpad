import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../invoices/invoices.schema';
import { Task, TaskDocument } from '../tasks/tasks.schema';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { TimeEntry, TimeEntryDocument } from '../time-tracking/time-tracking.schema';
import { Client, ClientDocument } from '../clients/clients.schema';
import { QueryReportDto } from './dto/query-report.dto';

const LIVE_INVOICE = { $nin: ['cancelled', 'draft'] };

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(TimeEntry.name) private readonly timeModel: Model<TimeEntryDocument>,
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>,
  ) {}

  range(query: QueryReportDto) {
    const now = new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const to = query.to ? new Date(query.to) : now;
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }

  private scoped(workspaceId: string, query: QueryReportDto, extra: Record<string, any> = {}) {
    const match: Record<string, any> = { workspaceId, isDeleted: false, ...extra };
    if (query.clientIds?.length) match.clientId = { $in: query.clientIds };
    if (query.projectIds?.length) match.projectId = { $in: query.projectIds };
    return match;
  }

  async summary(workspaceId: string, query: QueryReportDto) {
    const { from, to } = this.range(query);
    const [finance, tasks, projects, time] = await Promise.all([
      this.finance(workspaceId, query, from, to),
      this.tasksSummary(workspaceId, query, to),
      this.projectsSummary(workspaceId, query, from, to),
      this.timeSummary(workspaceId, query, from, to),
    ]);
    return {
      range: { from: from.toISOString(), to: to.toISOString() },
      finance,
      tasks,
      projects,
      time,
    };
  }

  private async finance(workspaceId: string, query: QueryReportDto, from: Date, to: Date) {
    const base = this.scoped(workspaceId, query, {
      status: LIVE_INVOICE,
      issueDate: { $gte: from, $lte: to },
    });
    const rows = await this.invoiceModel
      .find(base, { status: 1, type: 1, total: 1, currency: 1, clientId: 1, projectId: 1, number: 1, dueDate: 1 })
      .lean()
      .exec();

    const cur = (i: any) => i.currency ?? 'USD';
    const sum = (list: any[]) => list.reduce((s, i) => s + (i.total ?? 0), 0);
    const income = rows.filter((i) => (i.type ?? 'income') === 'income');
    const expenses = rows.filter((i) => i.type === 'expense');
    const paid = (l: any[]) => l.filter((i) => ['paid', 'collected'].includes(i.status));
    const open = (l: any[]) => l.filter((i) => ['pending', 'sent'].includes(i.status));
    const overdue = (l: any[]) => l.filter((i) => i.status === 'overdue');

    // Totales discriminados por moneda: nunca se suman USD con ARS.
    const bucket = (list: any[]) => {
      const map = new Map<string, number>();
      for (const i of list) {
        map.set(cur(i), (map.get(cur(i)) ?? 0) + (i.total ?? 0));
      }
      return [...map.entries()].map(([currency, total]) => ({ currency, total }));
    };

    const byClientMap = new Map<string, any>();
    for (const i of income) {
      const key = `${i.clientId ?? 'sin-cliente'}|${cur(i)}`;
      const row = byClientMap.get(key) ?? { clientId: i.clientId ?? null, currency: cur(i), invoiced: 0, collected: 0, pending: 0 };
      row.invoiced += i.total ?? 0;
      if (['paid', 'collected'].includes(i.status)) row.collected += i.total ?? 0;
      else row.pending += i.total ?? 0;
      byClientMap.set(key, row);
    }
    const clientIds = [...new Set([...byClientMap.values()].map((c) => c.clientId).filter(Boolean))];
    const clients = clientIds.length
      ? await this.clientModel.find({ workspaceId, _id: { $in: clientIds } }, { name: 1 }).lean().exec()
      : [];
    const names = new Map(clients.map((c: any) => [c._id.toString(), c.name]));

    const netByCurrency = (() => {
      const map = new Map<string, number>();
      for (const i of paid(income)) map.set(cur(i), (map.get(cur(i)) ?? 0) + (i.total ?? 0));
      for (const i of expenses) map.set(cur(i), (map.get(cur(i)) ?? 0) - (i.total ?? 0));
      return [...map.entries()].map(([currency, total]) => ({ currency, total }));
    })();

    return {
      totals: [
        { key: 'invoiced', label: 'Facturado', amounts: bucket(income) },
        { key: 'collected', label: 'Cobrado', amounts: bucket(paid(income)) },
        { key: 'pending', label: 'Pendiente', amounts: bucket(open(income)) },
        { key: 'overdue', label: 'Vencido', amounts: bucket(overdue(income)) },
        { key: 'expenses', label: 'Gastos', amounts: bucket(expenses) },
        { key: 'net', label: 'Neto', amounts: netByCurrency },
      ],
      byClient: [...byClientMap.values()].map((c) => ({
        ...c,
        name: c.clientId ? (names.get(c.clientId.toString()) ?? c.clientId) : 'Sin cliente',
      })),
      upcoming: open(income)
        .concat(overdue(income))
        .sort((a, b) => +new Date(a.dueDate ?? 0) - +new Date(b.dueDate ?? 0))
        .slice(0, 10)
        .map((i) => ({
          id: i._id,
          number: i.number,
          total: i.total,
          currency: cur(i),
          status: i.status,
          dueDate: i.dueDate,
          clientId: i.clientId ?? null,
          projectId: i.projectId ?? null,
        })),
    };
  }

  private async tasksSummary(workspaceId: string, query: QueryReportDto, now: Date) {
    const match = this.scoped(workspaceId, query);
    const rows = await this.taskModel
      .find(match, { status: 1, priority: 1, projectId: 1, dueDate: 1, updatedAt: 1 })
      .lean()
      .exec();
    const byStatus = (s: string) => rows.filter((t) => t.status === s).length;
    return {
      total: rows.length,
      done: byStatus('done'),
      inProgress: byStatus('in-progress'),
      todo: byStatus('todo'),
      cancelled: byStatus('cancelled'),
      overdue: rows.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && !['done', 'cancelled'].includes(t.status),
      ).length,
      byPriority: ['urgent', 'high', 'medium', 'low'].map((p) => ({
        priority: p,
        count: rows.filter((t) => (t.priority ?? 'medium') === p).length,
      })),
    };
  }

  private async projectsSummary(workspaceId: string, query: QueryReportDto, from: Date, to: Date) {
    const match: Record<string, any> = { workspaceId, isDeleted: false };
    if (query.clientIds?.length) match.clientId = { $in: query.clientIds };
    if (query.projectIds?.length) match._id = { $in: query.projectIds };
    const list = await this.projectModel
      .find(match, { name: 1, clientId: 1, status: 1, budget: 1, currency: 1 })
      .lean()
      .exec();
    const ids = list.map((p: any) => p._id.toString());
    const [invoices, tasks] = await Promise.all([
      this.invoiceModel
        .find({ workspaceId, isDeleted: false, projectId: { $in: ids }, status: LIVE_INVOICE, issueDate: { $gte: from, $lte: to } }, { projectId: 1, status: 1, total: 1 })
        .lean()
        .exec(),
      this.taskModel
        .find({ workspaceId, isDeleted: false, projectId: { $in: ids } }, { projectId: 1, status: 1 })
        .lean()
        .exec(),
    ]);
    return list.map((p: any) => {
      const pid = p._id.toString();
      const inv = invoices.filter((i: any) => i.projectId?.toString() === pid);
      const t = tasks.filter((x: any) => x.projectId?.toString() === pid);
      const collected = inv.filter((i: any) => ['paid', 'collected'].includes(i.status)).reduce((s: number, i: any) => s + (i.total ?? 0), 0);
      const done = t.filter((x: any) => x.status === 'done').length;
      const invoiced = inv.reduce((s: number, i: any) => s + (i.total ?? 0), 0);
      // Avance = porcentaje pagado al momento.
      const progress = invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0;
      return {
        id: pid,
        name: p.name,
        clientId: p.clientId ?? null,
        status: p.status,
        budget: p.budget ?? 0,
        currency: p.currency ?? 'USD',
        invoiced,
        collected,
        tasksTotal: t.length,
        tasksDone: done,
        progress,
      };
    });
  }

  private async timeSummary(workspaceId: string, query: QueryReportDto, from: Date, to: Date) {
    const match: Record<string, any> = {
      workspaceId,
      startTime: { $gte: from, $lte: to },
    };
    if (query.projectIds?.length) match.projectId = { $in: query.projectIds };
    const rows = await this.timeModel
      .find(match, { projectId: 1, duration: 1, billable: 1, hourlyRate: 1 })
      .lean()
      .exec();
    const billableRows = rows.filter((r) => r.billable);
    const byProjectMap = new Map<string, any>();
    for (const r of rows) {
      const key = r.projectId ?? 'sin-proyecto';
      const cur = byProjectMap.get(key) ?? { projectId: r.projectId ?? null, minutes: 0, billableMinutes: 0, billableAmount: 0 };
      cur.minutes += r.duration ?? 0;
      if (r.billable) {
        cur.billableMinutes += r.duration ?? 0;
        cur.billableAmount += ((r.duration ?? 0) / 60) * (r.hourlyRate ?? 0);
      }
      byProjectMap.set(key, cur);
    }
    return {
      totalMinutes: rows.reduce((s, r) => s + (r.duration ?? 0), 0),
      billableMinutes: billableRows.reduce((s, r) => s + (r.duration ?? 0), 0),
      billableAmount: billableRows.reduce((s, r) => s + ((r.duration ?? 0) / 60) * (r.hourlyRate ?? 0), 0),
      byProject: [...byProjectMap.values()],
    };
  }
}
