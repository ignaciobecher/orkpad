import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { Task, TaskDocument } from '../tasks/tasks.schema';
import { Invoice, InvoiceDocument } from '../invoices/invoices.schema';
import { Client, ClientDocument } from '../clients/clients.schema';

@Injectable()
export class AiContextService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>,
  ) {}

  async projectContext(workspaceId: string, projectId: string): Promise<string> {
    const [project, tasks, invoices] = await Promise.all([
      this.projectModel.findOne({ workspaceId, _id: projectId, isDeleted: false }).lean().exec(),
      this.taskModel.find({ workspaceId, projectId, isDeleted: false }, { title: 1, status: 1, dueDate: 1, priority: 1 }).lean().exec(),
      this.invoiceModel.find({ workspaceId, projectId, isDeleted: false, status: { $nin: ['cancelled', 'draft'] } }, { number: 1, total: 1, status: 1, dueDate: 1 }).lean().exec(),
    ]);
    if (!project) return '';
    const now = Date.now();
    const done = tasks.filter((t) => t.status === 'done').length;
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && +new Date(t.dueDate) < now && !['done', 'cancelled'].includes(t.status),
    );
    const paid = invoices.filter((i) => ['paid', 'collected'].includes(i.status));
    const open = invoices.filter((i) => ['pending', 'sent', 'overdue'].includes(i.status));
    const sum = (l: any[]) => l.reduce((s, i) => s + (i.total ?? 0), 0);
    const lines = [
      `Proyecto: ${project.name} (estado: ${project.status}, presupuesto: ${project.budget ?? 0} ${project.currency ?? ''})`,
      `Tareas: ${done}/${tasks.length} hechas. Vencidas: ${overdueTasks.map((t) => t.title).join('; ') || 'ninguna'}.`,
      `Facturas: cobrado ${sum(paid)}, pendiente ${sum(open)}.`,
      `Cuotas abiertas: ${open.map((i) => `${i.number ?? ''} $${i.total} vence ${i.dueDate ? new Date(i.dueDate).toISOString().slice(0, 10) : 's/d'}`).join('; ') || 'ninguna'}.`,
    ];
    return lines.join('\n');
  }

  async workspaceContext(workspaceId: string): Promise<string> {
    const [projects, invoices, tasks] = await Promise.all([
      this.projectModel.find({ workspaceId, isDeleted: false }, { name: 1, status: 1 }).lean().exec(),
      this.invoiceModel.find({ workspaceId, isDeleted: false, status: { $in: ['pending', 'sent', 'overdue'] } }, { number: 1, total: 1, status: 1, dueDate: 1, clientId: 1 }).lean().exec(),
      this.taskModel.countDocuments({ workspaceId, isDeleted: false, status: { $nin: ['done', 'cancelled'] } }).exec(),
    ]);
    const overdue = invoices.filter((i) => i.status === 'overdue').length;
    return [
      `Proyectos activos: ${projects.filter((p) => p.status === 'active').length} de ${projects.length}.`,
      `Facturas abiertas: ${invoices.length} (${overdue} vencidas).`,
      `Tareas abiertas: ${tasks}.`,
    ].join('\n');
  }
}
