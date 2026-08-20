import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalsRepository } from './goals.repository';
import { GoalEntriesRepository } from './goal-entries.repository';

const workspaceId = 'ws-1';
const userId = 'user-1';
const goalId = 'goal-1';

function makeGoal(overrides: Record<string, any> = {}) {
  return {
    _id: goalId,
    userId,
    title: 'Enviar 10 mails',
    type: 'habit',
    period: 'daily',
    targetCount: 10,
    timezone: 'UTC',
    currentStreak: 0,
    bestStreak: 0,
    toObject() {
      return this;
    },
    ...overrides,
  };
}

function makeEntry(overrides: Record<string, any> = {}) {
  return {
    _id: 'entry-1',
    goalId,
    userId,
    periodType: 'daily',
    periodKey: '2026-06-30',
    targetCount: 10,
    currentCount: 0,
    completed: false,
    completedAt: null,
    ...overrides,
  };
}

describe('GoalsService', () => {
  let service: GoalsService;
  let goalsRepository: jest.Mocked<GoalsRepository>;
  let goalEntriesRepository: jest.Mocked<GoalEntriesRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: GoalsRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: GoalEntriesRepository,
          useValue: {
            findOrCreateForPeriod: jest.fn(),
            findByPeriodKey: jest.fn(),
            incrementCount: jest.fn(),
            update: jest.fn(),
            findAll: jest.fn(),
            findHistory: jest.fn(),
            softDeleteByGoalId: jest.fn(),
            countTodaySummary: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(GoalsService);
    goalsRepository = module.get(GoalsRepository);
    goalEntriesRepository = module.get(GoalEntriesRepository);
  });

  describe('create', () => {
    it('creates a habit goal with default targetCount', async () => {
      goalsRepository.create.mockResolvedValue(makeGoal() as any);

      await service.create(workspaceId, userId, {
        title: 'Enviar 10 mails',
        type: 'habit',
        period: 'daily',
      } as any);

      expect(goalsRepository.create).toHaveBeenCalledWith(
        workspaceId,
        expect.objectContaining({ userId, targetCount: 1 }),
      );
    });

    it('rejects a target-type goal without dueDate', async () => {
      await expect(
        service.create(workspaceId, userId, {
          title: 'Facturar $5000',
          type: 'target',
          period: 'none',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a habit with period "none"', async () => {
      await expect(
        service.create(workspaceId, userId, {
          title: 'Bad habit',
          type: 'habit',
          period: 'none',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a target goal with a period other than none', async () => {
      await expect(
        service.create(workspaceId, userId, {
          title: 'Bad target',
          type: 'target',
          period: 'daily',
          dueDate: '2026-07-30',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the goal does not exist', async () => {
      goalsRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.findOne(workspaceId, userId, goalId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCurrentEntry', () => {
    it('derives the period key and lazily creates the entry', async () => {
      goalsRepository.findOneBy.mockResolvedValue(makeGoal() as any);
      goalEntriesRepository.findOrCreateForPeriod.mockResolvedValue(
        makeEntry() as any,
      );

      const entry = await service.getCurrentEntry(workspaceId, userId, goalId);

      expect(goalEntriesRepository.findOrCreateForPeriod).toHaveBeenCalledWith(
        workspaceId,
        goalId,
        userId,
        'daily',
        expect.any(String),
        expect.any(Date),
        expect.any(Date),
        10,
      );
      expect(entry.currentCount).toBe(0);
    });
  });

  describe('incrementProgress', () => {
    it('increments atomically and marks completed when target is reached', async () => {
      goalsRepository.findOneBy.mockResolvedValue(makeGoal() as any);
      goalEntriesRepository.findOrCreateForPeriod.mockResolvedValue(
        makeEntry({ currentCount: 9 }) as any,
      );
      goalEntriesRepository.incrementCount.mockResolvedValue(
        makeEntry({ currentCount: 10 }) as any,
      );
      goalEntriesRepository.update.mockResolvedValue(
        makeEntry({ currentCount: 10, completed: true }) as any,
      );
      goalsRepository.findOne.mockResolvedValue(makeGoal() as any);
      goalEntriesRepository.findByPeriodKey.mockResolvedValue(
        makeEntry({ currentCount: 10, completed: true }) as any,
      );

      const result = await service.incrementProgress(
        workspaceId,
        userId,
        goalId,
        { amount: 1 },
      );

      expect(goalEntriesRepository.incrementCount).toHaveBeenCalledWith(
        workspaceId,
        'entry-1',
        1,
      );
      expect(result.completed).toBe(true);
    });

    it('does not flip completion state when threshold is not crossed', async () => {
      goalsRepository.findOneBy.mockResolvedValue(makeGoal() as any);
      goalEntriesRepository.findOrCreateForPeriod.mockResolvedValue(
        makeEntry({ currentCount: 2 }) as any,
      );
      goalEntriesRepository.incrementCount.mockResolvedValue(
        makeEntry({ currentCount: 3 }) as any,
      );

      const result = await service.incrementProgress(
        workspaceId,
        userId,
        goalId,
        { amount: 1 },
      );

      expect(goalEntriesRepository.update).not.toHaveBeenCalled();
      expect(result.completed).toBe(false);
    });
  });

  describe('remove', () => {
    it('soft-deletes entries before soft-deleting the goal', async () => {
      goalsRepository.findOneBy.mockResolvedValue(makeGoal() as any);
      goalsRepository.softDelete.mockResolvedValue(makeGoal() as any);

      await service.remove(workspaceId, userId, goalId);

      expect(goalEntriesRepository.softDeleteByGoalId).toHaveBeenCalledWith(
        workspaceId,
        goalId,
      );
      expect(goalsRepository.softDelete).toHaveBeenCalledWith(
        workspaceId,
        goalId,
      );
    });
  });
});
