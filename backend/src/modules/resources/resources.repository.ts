import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource, ResourceDocument } from './resources.schema';
import {
  ResourceCategory,
  ResourceCategoryDocument,
} from './resource-category.schema';

@Injectable()
export class ResourcesRepository {
  constructor(
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<ResourceDocument>,
    @InjectModel(ResourceCategory.name)
    private readonly categoryModel: Model<ResourceCategoryDocument>,
  ) {}

  async findAll(
    filters: Record<string, unknown> = {},
    options: { page?: number; limit?: number } = {},
  ): Promise<{
    data: ResourceDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;
    const query = { ...filters, isDeleted: false };

    const [data, total] = await Promise.all([
      this.resourceModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.resourceModel.countDocuments(query),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<ResourceDocument | null> {
    return this.resourceModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  async findBySlug(slug: string): Promise<ResourceDocument | null> {
    return this.resourceModel.findOne({ slug, isDeleted: false }).exec();
  }

  async create(data: Partial<Resource>): Promise<ResourceDocument> {
    const doc = new this.resourceModel(data);
    return doc.save();
  }

  async update(
    id: string,
    data: Partial<Resource>,
  ): Promise<ResourceDocument | null> {
    return this.resourceModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: data },
        { new: true },
      )
      .exec();
  }

  async softDelete(id: string): Promise<ResourceDocument | null> {
    return this.resourceModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();
  }

  // ── Categories ───────────────────────────────────────────────────────────────

  async findAllCategories(): Promise<ResourceCategoryDocument[]> {
    return this.categoryModel
      .find({ isDeleted: false })
      .sort({ name: 1 })
      .exec();
  }

  async findCategoryById(id: string): Promise<ResourceCategoryDocument | null> {
    return this.categoryModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  async createCategory(
    data: Partial<ResourceCategory>,
  ): Promise<ResourceCategoryDocument> {
    const doc = new this.categoryModel(data);
    return doc.save();
  }

  async softDeleteCategory(
    id: string,
  ): Promise<ResourceCategoryDocument | null> {
    return this.categoryModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();
  }
}
