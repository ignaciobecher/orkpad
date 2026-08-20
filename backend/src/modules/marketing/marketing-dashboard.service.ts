import { Injectable } from '@nestjs/common';
import { MarketingPostRepository } from './marketing-post.repository';

const NETWORKS = ['linkedin', 'instagram', 'tiktok'] as const;

const RANKING_FIELD_BY_NETWORK: Record<(typeof NETWORKS)[number], string> = {
  linkedin: 'impressions',
  instagram: 'impressions',
  tiktok: 'views',
};

@Injectable()
export class MarketingDashboardService {
  constructor(
    private readonly marketingPostRepository: MarketingPostRepository,
  ) {}

  async getStats(workspaceId: string) {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const [
      postCountsByStatus,
      postCountsByNetwork,
      upcomingThisWeek,
      bestPerformingByNetwork,
      monthlyAverages,
      weeklyEvolution,
    ] = await Promise.all([
      this.marketingPostRepository.countByStatus(workspaceId),
      this.marketingPostRepository.countByNetwork(workspaceId),
      this.marketingPostRepository.findUpcoming(workspaceId, now, endOfWeek),
      this.getBestPerformingByNetwork(workspaceId),
      this.marketingPostRepository.getMonthlyMetricAverages(workspaceId, 6),
      this.marketingPostRepository.getWeeklyEvolution(workspaceId, 8),
    ]);

    return {
      postCountsByStatus,
      postCountsByNetwork,
      upcomingThisWeek,
      bestPerformingByNetwork,
      monthlyAverages,
      weeklyEvolution,
    };
  }

  private async getBestPerformingByNetwork(workspaceId: string) {
    const result: Record<string, any> = {};
    await Promise.all(
      NETWORKS.map(async (network) => {
        const rankingField = RANKING_FIELD_BY_NETWORK[network];
        result[network] =
          await this.marketingPostRepository.findBestPerformingByNetwork(
            workspaceId,
            network,
            rankingField,
          );
      }),
    );
    return result;
  }
}
