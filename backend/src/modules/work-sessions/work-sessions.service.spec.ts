import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkSessionsService } from './work-sessions.service';
import { WorkSessionsRepository } from './work-sessions.repository';

const workspaceId = 'ws-1';
const userId = 'user-1';
const sessionId = 'session-1';

function makeSession(overrides: Record<string, any> = {}) {
  return {
    _id: sessionId,
    workspaceId,
    userId,
    startTime: new Date('2026-07-06T09:00:00Z'),
    endTime: null,
    notes: null,
    ...overrides,
  };
}

describe('WorkSessionsService', () => {
  let service: WorkSessionsService;
  let repository: jest.Mocked<WorkSessionsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkSessionsService,
        {
          provide: WorkSessionsRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findActive: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            endActive: jest.fn(),
            findAllStaleActive: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(WorkSessionsService);
    repository = module.get(WorkSessionsRepository);
  });

  describe('start', () => {
    it('rejects when the user already has an active session', async () => {
      repository.findActive.mockResolvedValue(makeSession() as any);

      await expect(
        service.start(workspaceId, userId, {} as any),
      ).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('translates a duplicate-key error from a concurrent insert into the same BadRequestException', async () => {
      repository.findActive.mockResolvedValue(null);
      repository.create.mockRejectedValue({ code: 11000 });

      await expect(
        service.start(workspaceId, userId, {} as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('rethrows unrelated errors from create', async () => {
      repository.findActive.mockResolvedValue(null);
      const unrelated = new Error('connection lost');
      repository.create.mockRejectedValue(unrelated);

      await expect(service.start(workspaceId, userId, {} as any)).rejects.toBe(
        unrelated,
      );
    });

    it('creates the session when none is active', async () => {
      repository.findActive.mockResolvedValue(null);
      repository.create.mockResolvedValue(makeSession() as any);

      const result = await service.start(workspaceId, userId, {});

      expect(repository.create).toHaveBeenCalledWith(
        workspaceId,
        expect.objectContaining({ userId }),
      );
      expect(result).toEqual(makeSession());
    });
  });

  describe('end', () => {
    it('returns the updated session when the atomic end succeeds', async () => {
      const ended = makeSession({ endTime: new Date() });
      repository.endActive.mockResolvedValue(ended as any);

      const result = await service.end(workspaceId, sessionId);

      expect(result).toEqual(ended);
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the session does not exist at all', async () => {
      repository.endActive.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(null);

      await expect(service.end(workspaceId, sessionId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when the session exists but was already ended', async () => {
      repository.endActive.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(
        makeSession({ endTime: new Date() }) as any,
      );

      await expect(service.end(workspaceId, sessionId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('closeStaleActiveSessions', () => {
    it('does nothing when there are no stale sessions', async () => {
      repository.findAllStaleActive.mockResolvedValue([]);

      await service.closeStaleActiveSessions();

      expect(repository.endActive).not.toHaveBeenCalled();
    });

    it('closes each stale session using its own workspaceId', async () => {
      const staleA = makeSession({ _id: 'a', workspaceId: 'ws-a' });
      const staleB = makeSession({ _id: 'b', workspaceId: 'ws-b' });
      repository.findAllStaleActive.mockResolvedValue([staleA, staleB] as any);
      repository.endActive.mockResolvedValue(makeSession() as any);

      await service.closeStaleActiveSessions();

      expect(repository.endActive).toHaveBeenCalledWith(
        'ws-a',
        'a',
        expect.any(Date),
      );
      expect(repository.endActive).toHaveBeenCalledWith(
        'ws-b',
        'b',
        expect.any(Date),
      );
    });
  });
});
