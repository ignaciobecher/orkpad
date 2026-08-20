import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  PlannerTemplate,
  PlannerTemplateDocument,
} from './planner-templates.schema';

@Injectable()
export class PlannerTemplatesRepository extends BaseRepository<PlannerTemplateDocument> {
  constructor(
    @InjectModel(PlannerTemplate.name)
    private readonly plannerTemplateModel: Model<PlannerTemplateDocument>,
  ) {
    super(plannerTemplateModel);
  }

  async findWithPublic(
    workspaceId: string,
    userId: string,
    filters: Record<string, any> = {},
    options: { page?: number; limit?: number } = {},
  ): Promise<{
    data: PlannerTemplateDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {
      ...filters,
      isDeleted: false,
      $or: [{ workspaceId, userId }, { isPublic: true }],
    };

    const [data, total] = await Promise.all([
      this.plannerTemplateModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.plannerTemplateModel.countDocuments(query),
    ]);

    return { data, total, page, limit };
  }
}
