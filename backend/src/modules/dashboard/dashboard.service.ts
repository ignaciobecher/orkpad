import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../clients/clients.schema';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { Task, TaskDocument } from '../tasks/tasks.schema';
import { Invoice, InvoiceDocument } from '../invoices/invoices.schema';
import { ProjectsRepository } from '../projects/projects.repository';
import { TasksRepository } from '../tasks/tasks.repository';
import { TimeTrackingRepository } from '../time-tracking/time-tracking.repository';
import { ClientsRepository } from '../clients/clients.repository';
import { WorkloadConstellationResponseDto } from './dto/workload-constellation-response.dto';
import { WorkloadConstellationNodeDto } from './dto/workload-constellation-node.dto';
import { WorkloadConstellationTaskDto } from './dto/workload-constellation-task.dto';

const MAX_ORBIT_TASKS_PER_PROJECT = 15;

export interface RecentTask {
  _id: string;
  title: string;
  projectId?: string;
  projectName?: string;
  status: string;
  priority: string;
  dueDate?: Date;
}

export interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  totalTasks: number;
  revenueByCurrency: { currency: string; total: number }[];
  recentTasks: RecentTask[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    private readonly projectsRepository: ProjectsRepository,
    private readonly tasksRepository: TasksRepository,
    private readonly timeTrackingRepository: TimeTrackingRepository,
    private readonly clientsRepository: ClientsRepository,
  ) {}

  async getStats(workspaceId: string): Promise<DashboardStats> {
    const baseFilter = { workspaceId, isDeleted: false };
    const pendingFilter = {
      ...baseFilter,
      status: { $nin: ['done', 'cancelled'] },
    };

    const [
      totalClients,
      totalProjects,
      totalTasks,
      pendingTasks,
      revenueResult,
    ] = await Promise.all([
      this.clientModel.countDocuments(baseFilter as any),
      this.projectModel.countDocuments(baseFilter as any),
      this.taskModel.countDocuments(baseFilter as any),
      this.taskModel
        .find(pendingFilter as any)
        .sort({ createdAt: -1 })
        .limit(5)
        .exec(),
      this.invoiceModel.aggregate([
        { $match: { ...baseFilter, status: { $in: ['paid', 'collected'] }, type: 'income' } },
        { $group: { _id: { $ifNull: ['$currency', 'USD'] }, total: { $sum: '$total' } } },
      ]),
    ]);

    const projectIds = [
      ...new Set(pendingTasks.map((t) => t.projectId).filter(Boolean)),
    ];
    const projects = projectIds.length
      ? await this.projectModel
          .find({ _id: { $in: projectIds }, workspaceId } as any)
          .select('_id name')
          .exec()
      : [];
    const projectMap = new Map(
      projects.map((p) => [(p._id as any).toString(), p.name]),
    );

    const recentTasks: RecentTask[] = pendingTasks.map((t) => ({
      _id: (t._id as any).toString(),
      title: t.title,
      projectId: t.projectId,
      projectName: t.projectId ? projectMap.get(t.projectId) : undefined,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
    }));

    return {
      totalClients,
      totalProjects,
      totalTasks,
      revenueByCurrency: (revenueResult as { _id: string; total: number }[]).map((r) => ({
        currency: r._id ?? 'USD',
        total: r.total ?? 0,
      })),
      recentTasks,
    };
  }

  async getWorkloadConstellation(
    workspaceId: string,
  ): Promise<WorkloadConstellationResponseDto> {
    const now = new Date();
    const projects = await this.projectsRepository.findAllActive(workspaceId);

    if (!projects.length) {
      return { generatedAt: now.toISOString(), nodes: [] };
    }

    const projectIds = projects.map((p) => (p._id as any).toString());
    const clientIds = [
      ...new Set(projects.map((p) => p.clientId).filter(Boolean)),
    ];

    const [
      pendingTasks,
      lastActivityByTimeEntry,
      lastUpdatedByTask,
      clientNames,
    ] = await Promise.all([
      this.tasksRepository.findPendingByProjectIds(workspaceId, projectIds),
      this.timeTrackingRepository.findLastActivityByProject(
        workspaceId,
        projectIds,
      ),
      this.tasksRepository.findLastUpdatedByProject(workspaceId, projectIds),
      this.clientsRepository.findNamesByIds(workspaceId, clientIds),
    ]);

    const dayMs = 24 * 60 * 60 * 1000;
    const daysUntil = (date: Date) =>
      Math.ceil((new Date(date).getTime() - now.getTime()) / dayMs);

    const tasksByProject = new Map<string, TaskDocument[]>();
    for (const task of pendingTasks) {
      if (!task.projectId) continue;
      const list = tasksByProject.get(task.projectId) ?? [];
      list.push(task);
      tasksByProject.set(task.projectId, list);
    }

    const nodes: WorkloadConstellationNodeDto[] = projects.map((project) => {
      const projectId = (project._id as any).toString();

      // Nearest-due-first, undated tasks last; capped so one project can't crowd the whole scene.
      const orderedTasks = [...(tasksByProject.get(projectId) ?? [])].sort(
        (a, b) => {
          if (a.dueDate && b.dueDate)
            return a.dueDate.getTime() - b.dueDate.getTime();
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          return 0;
        },
      );
      const orbitTasks = orderedTasks.slice(0, MAX_ORBIT_TASKS_PER_PROJECT);

      const tasks: WorkloadConstellationTaskDto[] = orbitTasks.map((task) => ({
        taskId: (task._id as any).toString(),
        title: task.title,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
        daysUntilDue: task.dueDate ? daysUntil(task.dueDate) : null,
        status: task.status,
      }));

      const dueDate =
        orderedTasks.find((t) => t.dueDate)?.dueDate ?? project.endDate ?? null;
      const daysUntilDue = dueDate ? daysUntil(dueDate) : null;

      const timeEntryActivity = lastActivityByTimeEntry.get(projectId);
      const taskActivity = lastUpdatedByTask.get(projectId);
      const lastActivityAt =
        timeEntryActivity ?? taskActivity ?? project.updatedAt;
      const activitySource: 'time-entry' | 'task-update' | 'project-update' =
        timeEntryActivity
          ? 'time-entry'
          : taskActivity
            ? 'task-update'
            : 'project-update';
      const daysSinceActivity = Math.floor(
        (now.getTime() - new Date(lastActivityAt).getTime()) / dayMs,
      );

      return {
        projectId,
        projectName: project.name,
        clientId: project.clientId ?? null,
        clientName: project.clientId
          ? (clientNames.get(project.clientId) ?? null)
          : null,
        status: project.status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        daysUntilDue,
        lastActivityAt: new Date(lastActivityAt).toISOString(),
        daysSinceActivity,
        activitySource,
        tasks,
      };
    });

    return { generatedAt: now.toISOString(), nodes };
  }
}
