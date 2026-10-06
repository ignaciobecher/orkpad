import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingService } from './onboarding.service';
import { ClientsService } from '../clients/clients.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { QuotesService } from '../quotes/quotes.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

const workspaceId = 'ws-1';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let clientsService: jest.Mocked<ClientsService>;
  let projectsService: jest.Mocked<ProjectsService>;
  let tasksService: jest.Mocked<TasksService>;
  let quotesService: jest.Mocked<QuotesService>;
  let subscriptionsService: jest.Mocked<SubscriptionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: ClientsService,
          useValue: {
            findDemo: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: ProjectsService,
          useValue: {
            findDemo: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: TasksService,
          useValue: {
            findDemo: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: QuotesService,
          useValue: {
            findDemo: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: SubscriptionsService,
          useValue: {
            findDemo: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(OnboardingService);
    clientsService = module.get(ClientsService);
    projectsService = module.get(ProjectsService);
    tasksService = module.get(TasksService);
    quotesService = module.get(QuotesService);
    subscriptionsService = module.get(SubscriptionsService);
  });

  describe('getWelcomeContent', () => {
    it('returns a headline and a non-empty list of pillars', () => {
      const content = service.getWelcomeContent();
      expect(content.headline).toEqual(expect.any(String));
      expect(content.pillars.length).toBeGreaterThan(0);
      for (const pillar of content.pillars) {
        expect(pillar).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            description: expect.any(String),
            icon: expect.any(String),
            route: expect.any(String),
          }),
        );
      }
    });
  });

  describe('seedDemoData', () => {
    it('is a no-op when demo data already exists', async () => {
      clientsService.findDemo.mockResolvedValue({
        data: [{ _id: 'c1' }],
        total: 1,
        page: 1,
        limit: 100,
      } as any);

      const result = await service.seedDemoData(workspaceId);

      expect(result).toEqual({ alreadySeeded: true });
      expect(clientsService.create).not.toHaveBeenCalled();
    });

    it('creates a demo client, project and two tasks marked isDemo', async () => {
      clientsService.findDemo.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
      });
      clientsService.create.mockResolvedValue({ _id: 'client-1' } as any);
      projectsService.create.mockResolvedValue({ _id: 'project-1' } as any);
      tasksService.create
        .mockResolvedValueOnce({ _id: 'task-1' } as any)
        .mockResolvedValueOnce({ _id: 'task-2' } as any);
      quotesService.create.mockResolvedValue({ _id: 'quote-1' } as any);
      subscriptionsService.create.mockResolvedValue({ _id: 'sub-1' } as any);

      const result = await service.seedDemoData(workspaceId);

      expect(clientsService.create).toHaveBeenCalledWith(
        workspaceId,
        expect.objectContaining({ isDemo: true }),
      );
      expect(projectsService.create).toHaveBeenCalledWith(
        workspaceId,
        expect.objectContaining({ clientId: 'client-1', isDemo: true }),
      );
      expect(tasksService.create).toHaveBeenCalledTimes(2);
      expect(quotesService.create).toHaveBeenCalledWith(
        workspaceId,
        expect.objectContaining({ clientId: 'client-1', isDemo: true }),
      );
      expect(subscriptionsService.create).toHaveBeenCalledWith(
        workspaceId,
        expect.objectContaining({ clientId: 'client-1', isDemo: true }),
      );
      expect(tasksService.create).toHaveBeenNthCalledWith(
        1,
        workspaceId,
        expect.objectContaining({ projectId: 'project-1', isDemo: true }),
      );
      expect(result.alreadySeeded).toBe(false);
    });
  });

  describe('clearDemoData', () => {
    it('soft-deletes every demo client, project and task and reports the count removed', async () => {
      clientsService.findDemo.mockResolvedValue({
        data: [{ _id: 'c1' }],
        total: 1,
        page: 1,
        limit: 100,
      } as any);
      projectsService.findDemo.mockResolvedValue({
        data: [{ _id: 'p1' }],
        total: 1,
        page: 1,
        limit: 100,
      } as any);
      tasksService.findDemo.mockResolvedValue({
        data: [{ _id: 't1' }, { _id: 't2' }],
        total: 2,
        page: 1,
        limit: 100,
      } as any);
      quotesService.findDemo.mockResolvedValue({
        data: [{ _id: 'q1' }],
        total: 1,
        page: 1,
        limit: 100,
      } as any);
      subscriptionsService.findDemo.mockResolvedValue({
        data: [{ _id: 's1' }],
        total: 1,
        page: 1,
        limit: 100,
      } as any);

      const result = await service.clearDemoData(workspaceId);

      expect(clientsService.remove).toHaveBeenCalledWith(workspaceId, 'c1');
      expect(projectsService.remove).toHaveBeenCalledWith(workspaceId, 'p1');
      expect(tasksService.remove).toHaveBeenCalledWith(workspaceId, 't1');
      expect(tasksService.remove).toHaveBeenCalledWith(workspaceId, 't2');
      expect(quotesService.remove).toHaveBeenCalledWith(workspaceId, 'q1');
      expect(subscriptionsService.remove).toHaveBeenCalledWith(workspaceId, 's1');
      expect(result).toEqual({ removed: 6 });
    });
  });
});
