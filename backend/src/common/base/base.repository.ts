import { Model } from 'mongoose';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async findAll(
    workspaceId: string,
    filters: Record<string, any> = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<T>> {
    const {
      page: fPage,
      limit: fLimit,
      sort: fSort,
      ...queryFilters
    } = filters;

    const page = options.page ?? fPage ?? 1;
    const limit = Math.min(options.limit ?? fLimit ?? 20, 100);
    const sort = options.sort ?? fSort ?? { createdAt: -1 };
    const skip = (page - 1) * limit;

    const query = { ...queryFilters, workspaceId, isDeleted: false };

    // Clean query from undefined/null values
    Object.keys(query).forEach((key) => {
      if (query[key] === undefined || query[key] === '') {
        delete query[key];
      }
    });

    const [data, total] = await Promise.all([
      this.model
        .find(query as any)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query as any),
    ]);

    return { data, total, page, limit };
  }

  async findOne(workspaceId: string, id: string): Promise<T | null> {
    return this.model
      .findOne({ _id: id, workspaceId, isDeleted: false })
      .exec();
  }

  async findOneBy(
    workspaceId: string,
    filters: Record<string, any>,
  ): Promise<T | null> {
    return this.model
      .findOne({ ...filters, workspaceId, isDeleted: false })
      .exec();
  }

  async create(workspaceId: string, data: Record<string, any>): Promise<T> {
    const document = new this.model({ ...data, workspaceId });
    return (document as any).save();
  }

  async update(
    workspaceId: string,
    id: string,
    data: Record<string, any>,
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $set: data },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async softDelete(workspaceId: string, id: string): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async countDocuments(
    workspaceId: string,
    filters: Record<string, any> = {},
  ): Promise<number> {
    return this.model.countDocuments({
      ...filters,
      workspaceId,
      isDeleted: false,
    });
  }

  async exists(
    workspaceId: string,
    filters: Record<string, any>,
  ): Promise<boolean> {
    const count = await this.countDocuments(workspaceId, filters);
    return count > 0;
  }
}
