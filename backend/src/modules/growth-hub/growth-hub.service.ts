import { Injectable } from '@nestjs/common';
import { GoalsService } from '../goals/goals.service';
import { GamificationService } from '../gamification/gamification.service';
import { LearningService } from '../learning/learning.service';
import { OutreachService } from '../outreach/outreach.service';

@Injectable()
export class GrowthHubService {
  constructor(
    private readonly goalsService: GoalsService,
    private readonly gamificationService: GamificationService,
    private readonly learningService: LearningService,
    private readonly outreachService: OutreachService,
  ) {}

  async getSummary(workspaceId: string, userId: string) {
    const [profile, goalsSummary, currentFocus, learningToday, outreachWeek] =
      await Promise.all([
        this.gamificationService.getProfile(workspaceId, userId),
        this.goalsService.getSummary(workspaceId, userId),
        this.learningService.getCurrentFocus(workspaceId, userId),
        this.learningService.getTodayProgress(workspaceId, userId),
        this.outreachService.getCurrentWeek(workspaceId, userId),
      ]);

    return { profile, goalsSummary, currentFocus, learningToday, outreachWeek };
  }
}
