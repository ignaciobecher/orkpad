import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { MarketingIdea, MarketingIdeaDocument } from './marketing-idea.schema';

const STATUSES = ['idea', 'borrador', 'listo', 'publicado'] as const;

@Injectable()
export class MarketingIdeaRepository extends BaseRepository<MarketingIdeaDocument> {
  constructor(
    @InjectModel(MarketingIdea.name)
    private readonly marketingIdeaModel: Model<MarketingIdeaDocument>,
  ) {
    super(marketingIdeaModel);
  }

  async countByStatus(workspaceId: string): Promise<Record<string, number>> {
    const results = await this.marketingIdeaModel.aggregate([
      { $match: { workspaceId, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const counts: Record<string, number> = {};
    for (const status of STATUSES) counts[status] = 0;
    for (const r of results) counts[r._id] = r.count;
    return counts;
  }
}
