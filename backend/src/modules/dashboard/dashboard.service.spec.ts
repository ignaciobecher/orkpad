import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { ProjectsRepository } from '../projects/projects.repository';
import { TasksRepository } from '../tasks/tasks.repository';
import { TimeTrackingRepository } from '../time-tracking/time-tracking.repository';
import { ClientsRepository } from '../clients/clients.repository';
import { Client } from '../clients/clients.schema';
import { Project } from '../projects/projects.schema';
import { Task } from '../tasks/tasks.schema';
import { Invoice } from '../invoices/invoices.schema';

const workspaceId = 'ws-1';

function makeProject(overrides: Record<string, any> = {}) {
  return {
    _id: 'project-1',
    name: 'Website Redesign',
    clientId: 'client-1',
    status: 'active',
    endDate: new Date('2026-08-01T00:00:00Z'),
    updatedAt: new Date('2026-07-01T00:00:00Z'),
    ...overrides,
  };
}

function makeTask(overrides: Record<string, any> = {}) {
  return {
    _id: 'task-1',
    projectId: 'project-1',
    title: 'Do the thing',
    status: 'todo',
    dueDate: null,
    ...overrides,
  };
}

describe('DashboardService', () => {
  let service: DashboardService;
  let projectsRepository: jest.Mocked<ProjectsRepository>;
  let tasksRepository: jest.Mocked<TasksRepository>;
  let timeTrackingRepository: jest.Mocked<TimeTrackingRepository>;
  let clientsRepository: jest.Mocked<ClientsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Client.name), useValue: {} },
        { provide: getModelToken(Project.name), useValue: {} },
        { provide: getModelToken(Task.name), useValue: {} },
        { provide: getModelToken(Invoice.name), useValue: {} },
        {
          provide: ProjectsRepository,
          useValue: { findAllActive: jest.fn() },
        },
        {
          provide: TasksRepository,
          useValue: {
            findPendingByProjectIds: jest.fn(),
            findLastUpdatedByProject: jest.fn(),
          },
        },
        {
          provide: TimeTrackingRepository,
          useValue: { findLastActivityByProject: jest.fn() },
        },
        {
          provide: ClientsRepository,
          useValue: { findNamesByIds: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(DashboardService);
    projectsRepository = module.get(ProjectsRepository);
    tasksRepository = module.get(TasksRepository);
    timeTrackingRepository = module.get(TimeTrackingRepository);
    clientsRepository = module.get(ClientsRepository);
  });

  describe('getWorkloadConstellation', () => {
    it('returns an empty node list when the workspace has no active projects', async () => {
      projectsRepository.findAllActive.mockResolvedValue([]);

      const result = await service.getWorkloadConstellation(workspaceId);

      expect(result.nodes).toEqual([]);
      expect(tasksRepository.findPendingByProjectIds).not.toHaveBeenCalled();
    });

    it('prefers the nearest upcoming task due date over the project end date, and includes it in the orbit tasks', async () => {
      projectsRepository.findAllActive.mockResolvedValue([
        makeProject(),
      ] as any);
      tasksRepository.findPendingByProjectIds.mockResolvedValue([
        makeTask({
          _id: 'task-1',
          title: 'Ship it',
          dueDate: new Date('2026-07-20T00:00:00Z'),
        }),
      ] as any);
      tasksRepository.findLastUpdatedByProject.mockResolvedValue(new Map());
      timeTrackingRepository.findLastActivityByProject.mockResolvedValue(
        new Map(),
      );
      clientsRepository.findNamesByIds.mockResolvedValue(
        new Map([['client-1', 'Acme Corp']]),
      );

      const result = await service.getWorkloadConstellation(workspaceId);

      expect(result.nodes[0].dueDate).toBe('2026-07-20T00:00:00.000Z');
      expect(result.nodes[0].clientName).toBe('Acme Corp');
      expect(result.nodes[0].tasks).toHaveLength(1);
      expect(result.nodes[0].tasks[0]).toMatchObject({
        taskId: 'task-1',
        title: 'Ship it',
      });
    });

    it('falls back to the project end date when no task has a due date', async () => {
      projectsRepository.findAllActive.mockResolvedValue([
        makeProject(),
      ] as any);
      tasksRepository.findPendingByProjectIds.mockResolvedValue([
        makeTask({ dueDate: null }),
      ] as any);
      tasksRepository.findLastUpdatedByProject.mockResolvedValue(new Map());
      timeTrackingRepository.findLastActivityByProject.mockResolvedValue(
        new Map(),
      );
      clientsRepository.findNamesByIds.mockResolvedValue(new Map());

      const result = await service.getWorkloadConstellation(workspaceId);

      expect(result.nodes[0].dueDate).toBe('2026-08-01T00:00:00.000Z');
    });

    it('returns a null dueDate/daysUntilDue when neither a task due date nor a project end date exist', async () => {
      projectsRepository.findAllActive.mockResolvedValue([
        makeProject({ endDate: undefined }),
      ] as any);
      tasksRepository.findPendingByProjectIds.mockResolvedValue([]);
      tasksRepository.findLastUpdatedByProject.mockResolvedValue(new Map());
      timeTrackingRepository.findLastActivityByProject.mockResolvedValue(
        new Map(),
      );
      clientsRepository.findNamesByIds.mockResolvedValue(new Map());

      const result = await service.getWorkloadConstellation(workspaceId);

      expect(result.nodes[0].dueDate).toBeNull();
      expect(result.nodes[0].daysUntilDue).toBeNull();
      expect(result.nodes[0].tasks).toEqual([]);
    });

    it('orders orbit tasks by nearest due date first, with undated tasks last', async () => {
      projectsRepository.findAllActive.mockResolvedValue([
        makeProject(),
      ] as any);
      tasksRepository.findPendingByProjectIds.mockResolvedValue([
        makeTask({ _id: 'task-undated', title: 'No date', dueDate: null }),
        makeTask({
          _id: 'task-far',
          title: 'Far out',
          dueDate: new Date('2026-09-01T00:00:00Z'),
        }),
        makeTask({
          _id: 'task-near',
          title: 'Urgent',
          dueDate: new Date('2026-07-15T00:00:00Z'),
        }),
      ] as any);
      tasksRepository.findLastUpdatedByProject.mockResolvedValue(new Map());
      timeTrackingRepository.findLastActivityByProject.mockResolvedValue(
        new Map(),
      );
      clientsRepository.findNamesByIds.mockResolvedValue(new Map());

      const result = await service.getWorkloadConstellation(workspaceId);

      expect(result.nodes[0].tasks.map((t) => t.taskId)).toEqual([
        'task-near',
        'task-far',
        'task-undated',
      ]);
    });

    it('caps orbit tasks at 15 per project', async () => {
      projectsRepository.findAllActive.mockResolvedValue([
        makeProject(),
      ] as any);
      tasksRepository.findPendingByProjectIds.mockResolvedValue(
        Array.from({ length: 20 }, (_, i) =>
          makeTask({
            _id: `task-${i}`,
            dueDate: new Date(`2026-07-${10 + i}T00:00:00Z`),
          }),
        ) as any,
      );
      tasksRepository.findLastUpdatedByProject.mockResolvedValue(new Map());
      timeTrackingRepository.findLastActivityByProject.mockResolvedValue(
        new Map(),
      );
      clientsRepository.findNamesByIds.mockResolvedValue(new Map());

      const result = await service.getWorkloadConstellation(workspaceId);

      expect(result.nodes[0].tasks).toHaveLength(15);
      expect(result.nodes[0].tasks[0].taskId).toBe('task-0');
    });

    it('follows the staleness fallback chain: time entry -> task update -> project update', async () => {
      projectsRepository.findAllActive.mockResolvedValue([
        makeProject(),
      ] as any);
      tasksRepository.findPendingByProjectIds.mockResolvedValue([]);
      clientsRepository.findNamesByIds.mockResolvedValue(new Map());

      // No time entry, no task update -> falls back to project.updatedAt
      tasksRepository.findLastUpdatedByProject.mockResolvedValue(new Map());
      timeTrackingRepository.findLastActivityByProject.mockResolvedValue(
        new Map(),
      );
      let result = await service.getWorkloadConstellation(workspaceId);
      expect(result.nodes[0].lastActivityAt).toBe('2026-07-01T00:00:00.000Z');
      expect(result.nodes[0].activitySource).toBe('project-update');

      // Task update present, no time entry -> uses task update, even though the
      // project document itself hasn't been touched in a long time.
      tasksRepository.findLastUpdatedByProject.mockResolvedValue(
        new Map([['project-1', new Date('2026-07-05T00:00:00Z')]]),
      );
      result = await service.getWorkloadConstellation(workspaceId);
      expect(result.nodes[0].lastActivityAt).toBe('2026-07-05T00:00:00.000Z');
      expect(result.nodes[0].activitySource).toBe('task-update');

      // Time entry present -> wins over task update and project update
      timeTrackingRepository.findLastActivityByProject.mockResolvedValue(
        new Map([['project-1', new Date('2026-07-10T00:00:00Z')]]),
      );
      result = await service.getWorkloadConstellation(workspaceId);
      expect(result.nodes[0].lastActivityAt).toBe('2026-07-10T00:00:00.000Z');
      expect(result.nodes[0].activitySource).toBe('time-entry');
    });

    it('resolves client names for multiple projects sharing the same client', async () => {
      projectsRepository.findAllActive.mockResolvedValue([
        makeProject({ _id: 'project-1' }),
        makeProject({ _id: 'project-2' }),
      ] as any);
      tasksRepository.findPendingByProjectIds.mockResolvedValue([]);
      tasksRepository.findLastUpdatedByProject.mockResolvedValue(new Map());
      timeTrackingRepository.findLastActivityByProject.mockResolvedValue(
        new Map(),
      );
      clientsRepository.findNamesByIds.mockResolvedValue(
        new Map([['client-1', 'Acme Corp']]),
      );

      const result = await service.getWorkloadConstellation(workspaceId);

      expect(result.nodes).toHaveLength(2);
      expect(clientsRepository.findNamesByIds).toHaveBeenCalledWith(
        workspaceId,
        ['client-1'],
      );
      expect(result.nodes.every((n) => n.clientName === 'Acme Corp')).toBe(
        true,
      );
    });
  });
});
