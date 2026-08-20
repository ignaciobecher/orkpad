import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { TimeTrackingRepository } from './time-tracking.repository';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';
import { WorkSessionsService } from '../work-sessions/work-sessions.service';

const workspaceId = 'ws-1';
const userId = 'user-1';
const entryId = 'entry-1';
const sessionId = 'session-1';

function makeEntry(overrides: Record<string, any> = {}) {
  return {
    _id: entryId,
    userId,
    projectId: undefined,
    taskId: undefined,
    startTime: new Date('2026-07-06T09:00:00Z'),
    endTime: new Date('2026-07-06T10:00:00Z'),
    duration: 60,
    sessionId: null,
    ...overrides,
  };
}

function makeSession(overrides: Record<string, any> = {}) {
  return {
    _id: sessionId,
    userId,
    startTime: new Date('2026-07-06T08:00:00Z'),
    endTime: null,
    ...overrides,
  };
}

describe('TimeTrackingService', () => {
  let service: TimeTrackingService;
  let repository: jest.Mocked<TimeTrackingRepository>;
  let usersService: jest.Mocked<UsersService>;
  let workSessionsService: jest.Mocked<WorkSessionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeTrackingService,
        {
          provide: TimeTrackingRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: ProjectsService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: TasksService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: UsersService,
          useValue: { findWorkspaceMemberById: jest.fn() },
        },
        {
          provide: WorkSessionsService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(TimeTrackingService);
    repository = module.get(TimeTrackingRepository);
    usersService = module.get(UsersService);
    workSessionsService = module.get(WorkSessionsService);

    usersService.findWorkspaceMemberById.mockResolvedValue({
      _id: userId,
    } as any);
  });

  describe('create', () => {
    it('rejects a sessionId that does not reference an existing work session', async () => {
      workSessionsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        service.create(workspaceId, userId, {
          startTime: '2026-07-06T09:00:00Z',
          sessionId,
        } as any),
      ).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('rejects a sessionId that references an already-ended work session', async () => {
      workSessionsService.findOne.mockResolvedValue(
        makeSession({ endTime: new Date() }) as any,
      );

      await expect(
        service.create(workspaceId, userId, {
          startTime: '2026-07-06T09:00:00Z',
          sessionId,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts a sessionId that references an active work session', async () => {
      workSessionsService.findOne.mockResolvedValue(makeSession() as any);
      repository.create.mockResolvedValue(makeEntry() as any);

      await service.create(workspaceId, userId, {
        startTime: '2026-07-06T09:00:00Z',
        sessionId,
      });

      expect(repository.create).toHaveBeenCalled();
    });

    it('allows creating an entry without a sessionId at all', async () => {
      repository.create.mockResolvedValue(makeEntry() as any);

      await service.create(workspaceId, userId, {
        startTime: '2026-07-06T09:00:00Z',
      });

      expect(workSessionsService.findOne).not.toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('accepts a sessionId referencing an already-ended work session (no active-session requirement on update)', async () => {
      repository.findOne.mockResolvedValue(makeEntry({ sessionId }) as any);
      workSessionsService.findOne.mockResolvedValue(
        makeSession({ endTime: new Date() }) as any,
      );
      repository.update.mockResolvedValue(makeEntry({ sessionId }) as any);

      await service.update(workspaceId, entryId, {
        description: 'updated',
      });

      expect(repository.update).toHaveBeenCalled();
    });

    it('still rejects a sessionId that does not exist at all on update', async () => {
      repository.findOne.mockResolvedValue(
        makeEntry({ sessionId: 'stale-session' }) as any,
      );
      workSessionsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        service.update(workspaceId, entryId, {} as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
