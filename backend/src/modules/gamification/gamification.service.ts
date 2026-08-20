import { Injectable, Optional } from '@nestjs/common';
import { GamificationProfileRepository } from './gamification-profile.repository';
import { GamificationEventRepository } from './gamification-event.repository';
import { GamificationEventType } from './gamification-event.schema';
import { GamificationProfileDocument } from './gamification-profile.schema';
import { computeLevel, pointsForNextLevel } from './gamification-level.util';
import { BADGES } from './gamification-badges.config';
import {
  GAMIFICATION_POINTS,
  STREAK_MILESTONES,
} from './gamification.constants';
import { NotificationsService } from '../notifications/notifications.service';

export type GamificationStatKey =
  | 'goalsCompleted'
  | 'learningEntriesLogged'
  | 'resourcesCompleted'
  | 'skillFociCompleted'
  | 'outreachActivitiesLogged';

interface AwardPointsInput {
  type: GamificationEventType;
  points: number;
  refId: string;
  refType: string;
  statKey?: GamificationStatKey;
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterdayKey(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

@Injectable()
export class GamificationService {
  constructor(
    private readonly profileRepository: GamificationProfileRepository,
    private readonly eventRepository: GamificationEventRepository,
    @Optional() private readonly notificationsService: NotificationsService,
  ) {}

  async getProfile(workspaceId: string, userId: string) {
    const profile = await this.profileRepository.findOrCreateForUser(
      workspaceId,
      userId,
    );
    return this.serializeProfile(profile);
  }

  async getEvents(
    workspaceId: string,
    userId: string,
    query: { page?: number; limit?: number } = {},
  ) {
    return this.eventRepository.findHistory(workspaceId, userId, query);
  }

  async awardPoints(
    workspaceId: string,
    userId: string,
    input: AwardPointsInput,
  ): Promise<void> {
    const event = await this.eventRepository.createIfNotExists(
      workspaceId,
      userId,
      {
        type: input.type,
        points: input.points,
        refId: input.refId,
        refType: input.refType,
      },
    );
    if (!event) return; // already awarded, idempotent no-op

    const profile = await this.profileRepository.findOrCreateForUser(
      workspaceId,
      userId,
    );

    const streak = this.computeUpdatedStreak(profile);
    const totalPoints = profile.totalPoints + input.points;
    const level = computeLevel(totalPoints);
    const leveledUp = level > profile.level;

    const stats = { ...(profile.stats as any) };
    if (input.statKey) {
      stats[input.statKey] = (stats[input.statKey] ?? 0) + 1;
    }

    const updated = await this.profileRepository.update(
      workspaceId,
      String(profile._id),
      {
        totalPoints,
        level,
        currentStreakDays: streak.current,
        bestStreakDays: streak.best,
        lastActivityDate: new Date(),
        stats,
      },
    );
    if (!updated) return;

    if (input.type !== 'streak_milestone') {
      await this.checkStreakMilestones(workspaceId, userId, streak.current);
    }

    const newBadges = this.evaluateNewBadges(updated);
    if (newBadges.length > 0) {
      await this.profileRepository.update(workspaceId, String(updated._id), {
        badges: [...updated.badges, ...newBadges.map((b) => b.code)],
      });
      for (const badge of newBadges) {
        await this.notify(
          workspaceId,
          userId,
          `Nuevo logro: ${badge.name}`,
          badge.description,
          'success',
        );
      }
    }

    if (leveledUp) {
      await this.notify(
        workspaceId,
        userId,
        `¡Subiste a nivel ${level}!`,
        'Seguí sumando puntos para el próximo nivel.',
        'success',
      );
    }
  }

  async revokePoints(
    workspaceId: string,
    userId: string,
    refType: string,
    refId: string,
  ): Promise<void> {
    const event = await this.eventRepository.deleteByRef(
      workspaceId,
      refType,
      refId,
    );
    if (!event) return;

    const profile = await this.profileRepository.findOrCreateForUser(
      workspaceId,
      userId,
    );
    const totalPoints = Math.max(0, profile.totalPoints - event.points);
    const level = computeLevel(totalPoints);

    await this.profileRepository.update(workspaceId, String(profile._id), {
      totalPoints,
      level,
    });
  }

  private async checkStreakMilestones(
    workspaceId: string,
    userId: string,
    currentStreak: number,
  ): Promise<void> {
    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak !== milestone) continue;
      const points =
        milestone === 7
          ? GAMIFICATION_POINTS.STREAK_7
          : milestone === 30
            ? GAMIFICATION_POINTS.STREAK_30
            : GAMIFICATION_POINTS.STREAK_100;

      await this.awardPoints(workspaceId, userId, {
        type: 'streak_milestone',
        points,
        refId: `streak-${milestone}`,
        refType: 'streak_milestone',
      });
    }
  }

  private computeUpdatedStreak(profile: GamificationProfileDocument): {
    current: number;
    best: number;
  } {
    const lastKey = profile.lastActivityDate
      ? profile.lastActivityDate.toISOString().split('T')[0]
      : null;
    const today = todayKey();
    const yesterday = yesterdayKey();

    let current = profile.currentStreakDays ?? 0;
    if (lastKey === today) {
      // already logged activity today, streak unchanged
    } else if (lastKey === yesterday) {
      current += 1;
    } else {
      current = 1;
    }

    const best = Math.max(profile.bestStreakDays ?? 0, current);
    return { current, best };
  }

  private evaluateNewBadges(profile: GamificationProfileDocument) {
    const metrics: Record<string, number> = {
      bestStreakDays: profile.bestStreakDays,
      level: profile.level,
      totalPoints: profile.totalPoints,
      resourcesCompleted: (profile.stats as any)?.resourcesCompleted ?? 0,
      skillFociCompleted: (profile.stats as any)?.skillFociCompleted ?? 0,
      goalsCompleted: (profile.stats as any)?.goalsCompleted ?? 0,
    };

    return BADGES.filter(
      (badge) =>
        !profile.badges.includes(badge.code) &&
        metrics[badge.condition.metric] >= badge.condition.threshold,
    );
  }

  private async notify(
    workspaceId: string,
    userId: string,
    title: string,
    message: string,
    type: 'success' | 'info',
  ) {
    if (!this.notificationsService) return;
    await this.notificationsService.create(workspaceId, {
      userId,
      title,
      message,
      type,
      link: '/app/growth',
    });
  }

  private serializeProfile(profile: GamificationProfileDocument) {
    return {
      ...(profile as any).toObject(),
      nextLevel: pointsForNextLevel(profile.totalPoints),
    };
  }
}
