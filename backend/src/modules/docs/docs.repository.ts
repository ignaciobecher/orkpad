import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BaseRepository,
  type PaginatedResult,
} from '../../common/base/base.repository';
import { Document, DocumentDocument } from './docs.schema';

@Injectable()
export class DocumentsRepository extends BaseRepository<DocumentDocument> {
  constructor(
    @InjectModel(Document.name)
    private readonly documentModel: Model<DocumentDocument>,
  ) {
    super(documentModel);
  }

  // Docs tree view needs all docs at once — allow up to 2000 instead of the base 100 cap
  override async findAll(
    workspaceId: string,
    filters: Record<string, any> = {},
    options: {
      page?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
    } = {},
  ): Promise<PaginatedResult<DocumentDocument>> {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 2000);
    const sort = options.sort ?? { createdAt: -1 };
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {
      ...filters,
      workspaceId,
      isDeleted: false,
    };
    Object.keys(query).forEach((key) => {
      if (query[key] === undefined || query[key] === '') delete query[key];
    });

    const [data, total] = await Promise.all([
      this.model
        .find(query)
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query),
    ]);

    return { data, total, page, limit };
  }
}
