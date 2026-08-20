import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { MarketingPost, MarketingPostDocument } from './marketing-post.schema';

const STATUSES = ['idea', 'borrador', 'listo', 'publicado'] as const;
const NETWORKS = ['linkedin', 'instagram', 'tiktok'] as const;

@Injectable()
export class MarketingPostRepository extends BaseRepository<MarketingPostDocument> {
  constructor(
    @InjectModel(MarketingPost.name)
    private readonly marketingPostModel: Model<MarketingPostDocument>,
  ) {
    super(marketingPostModel);
  }

  async findByDateRange(
    workspaceId: string,
    from: Date,
    to: Date,
    filters: Record<string, any> = {},
  ): Promise<MarketingPostDocument[]> {
    return this.marketingPostModel
      .find({
        ...filters,
        workspaceId,
        isDeleted: false,
        scheduledDate: { $gte: from, $lte: to },
      })
      .sort({ scheduledDate: 1 })
      .exec();
  }

  async findUpcoming(
    workspaceId: string,
    from: Date,
    to: Date,
  ): Promise<MarketingPostDocument[]> {
    return this.marketingPostModel
      .find({
        workspaceId,
        isDeleted: false,
        scheduledDate: { $gte: from, $lte: to },
      })
      .sort({ scheduledDate: 1 })
      .exec();
  }

  async countByStatus(workspaceId: string): Promise<Record<string, number>> {
    const results = await this.marketingPostModel.aggregate([
      { $match: { workspaceId, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const counts: Record<string, number> = {};
    for (const status of STATUSES) counts[status] = 0;
    for (const r of results) counts[r._id] = r.count;
    return counts;
  }

  async countByNetwork(workspaceId: string): Promise<Record<string, number>> {
    const results = await this.marketingPostModel.aggregate([
      { $match: { workspaceId, isDeleted: false } },
      { $group: { _id: '$network', count: { $sum: 1 } } },
    ]);

    const counts: Record<string, number> = {};
    for (const network of NETWORKS) counts[network] = 0;
    for (const r of results) counts[r._id] = r.count;
    return counts;
  }

  async findBestPerformingByNetwork(
    workspaceId: string,
    network: string,
    rankingField: string,
  ): Promise<MarketingPostDocument | null> {
    const metricPath = `metrics.${rankingField}`;
    return this.marketingPostModel
      .findOne({
        workspaceId,
        isDeleted: false,
        network,
        status: 'publicado',
        [metricPath]: { $exists: true, $ne: null },
      })
      .sort({ [metricPath]: -1 })
      .exec();
  }

  async getMonthlyMetricAverages(
    workspaceId: string,
    monthsBack: number,
  ): Promise<any[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - monthsBack);

    return this.marketingPostModel.aggregate([
      {
        $match: {
          workspaceId,
          isDeleted: false,
          status: 'publicado',
          metrics: { $ne: null },
          'metrics.recordedAt': { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$metrics.recordedAt' },
            month: { $month: '$metrics.recordedAt' },
            network: '$network',
          },
          avgImpressions: { $avg: '$metrics.impressions' },
          avgViews: { $avg: '$metrics.views' },
          avgReach: { $avg: '$metrics.reach' },
          avgLikes: { $avg: '$metrics.likes' },
          avgReactions: { $avg: '$metrics.reactions' },
          avgComments: { $avg: '$metrics.comments' },
          avgShares: { $avg: '$metrics.shares' },
          avgReposts: { $avg: '$metrics.reposts' },
          avgSaves: { $avg: '$metrics.saves' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.network': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          network: '$_id.network',
          avgImpressions: 1,
          avgViews: 1,
          avgReach: 1,
          avgLikes: 1,
          avgReactions: 1,
          avgComments: 1,
          avgShares: 1,
          avgReposts: 1,
          avgSaves: 1,
          count: 1,
        },
      },
    ]);
  }

  async getWeeklyEvolution(
    workspaceId: string,
    weeksBack: number,
  ): Promise<any[]> {
    const since = new Date();
    since.setDate(since.getDate() - weeksBack * 7);

    return this.marketingPostModel.aggregate([
      {
        $match: {
          workspaceId,
          isDeleted: false,
          status: 'publicado',
          metrics: { $ne: null },
          'metrics.recordedAt': { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$metrics.recordedAt' },
            week: { $isoWeek: '$metrics.recordedAt' },
          },
          totalImpressions: { $sum: '$metrics.impressions' },
          totalViews: { $sum: '$metrics.views' },
          totalReach: { $sum: '$metrics.reach' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          week: '$_id.week',
          impressions: '$totalImpressions',
          views: '$totalViews',
          reach: '$totalReach',
          count: 1,
        },
      },
    ]);
  }

  async bulkCreate(
    workspaceId: string,
    dataArray: Record<string, any>[],
  ): Promise<MarketingPostDocument[]> {
    const documents = dataArray.map((data) => ({ ...data, workspaceId }));
    const result = await this.marketingPostModel.insertMany(documents as any[]);
    return result as unknown as MarketingPostDocument[];
  }
}
