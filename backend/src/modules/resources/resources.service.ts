import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResourcesRepository } from './resources.repository';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { QueryResourceDto } from './dto/query-resource.dto';
import { CreateResourceCategoryDto } from './dto/create-resource-category.dto';

@Injectable()
export class ResourcesService {
  constructor(private readonly resourcesRepository: ResourcesRepository) {}

  async findAll(query: QueryResourceDto) {
    const { page, limit, search, category, tag } = query;
    const filters: Record<string, any> = { isPublished: true };

    if (category) filters.categoryId = category;
    if (tag) filters.tags = tag;
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    return this.resourcesRepository.findAll(filters, { page, limit });
  }

  async findAllAdmin(query: QueryResourceDto) {
    const { page, limit, search } = query;
    const filters: Record<string, any> = {};

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    return this.resourcesRepository.findAll(filters, { page, limit });
  }

  async findBySlug(slug: string) {
    const resource = await this.resourcesRepository.findBySlug(slug);
    if (!resource || !resource.isPublished) {
      throw new NotFoundException(`Resource '${slug}' not found`);
    }
    return resource;
  }

  async findOne(id: string) {
    const resource = await this.resourcesRepository.findOne(id);
    if (!resource) throw new NotFoundException(`Resource ${id} not found`);
    return resource;
  }

  async create(dto: CreateResourceDto) {
    const existing = await this.resourcesRepository.findBySlug(dto.slug);
    if (existing)
      throw new ConflictException(`Slug '${dto.slug}' already exists`);

    const data: Record<string, any> = { ...dto };
    if (dto.isPublished) data.publishedAt = new Date();

    return this.resourcesRepository.create(data);
  }

  async update(id: string, dto: UpdateResourceDto) {
    const current = await this.findOne(id);
    const data: Record<string, any> = { ...dto };

    if (dto.isPublished && !current.isPublished) {
      data.publishedAt = new Date();
    }

    const resource = await this.resourcesRepository.update(id, data);
    if (!resource) throw new NotFoundException(`Resource ${id} not found`);
    return resource;
  }

  async remove(id: string) {
    const resource = await this.resourcesRepository.softDelete(id);
    if (!resource) throw new NotFoundException(`Resource ${id} not found`);
    return resource;
  }

  // ── Categories ───────────────────────────────────────────────────────────────

  findAllCategories() {
    return this.resourcesRepository.findAllCategories();
  }

  async createCategory(dto: CreateResourceCategoryDto) {
    return this.resourcesRepository.createCategory(dto);
  }

  async removeCategory(id: string) {
    const category = await this.resourcesRepository.softDeleteCategory(id);
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }
}
