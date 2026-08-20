import { Injectable, NotFoundException } from '@nestjs/common';
import { TestimonialsRepository } from './testimonials.repository';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { QueryTestimonialDto } from './dto/query-testimonial.dto';
import { ReorderTestimonialsDto } from './dto/reorder-testimonials.dto';
import { TestimonialDocument } from './testimonials.schema';

@Injectable()
export class TestimonialsService {
  constructor(private readonly repository: TestimonialsRepository) {}

  findAll(workspaceId: string, query: QueryTestimonialDto) {
    const { page, limit, search, isPublic, projectId } = query;
    const filters: Record<string, any> = {};
    if (isPublic !== undefined) filters.isPublic = isPublic;
    if (projectId) filters.projectId = projectId;
    if (search) {
      filters.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    return this.repository.findAll(workspaceId, filters, {
      page,
      limit,
      sort: { order: 1, createdAt: -1 },
    });
  }

  async findOne(workspaceId: string, id: string): Promise<TestimonialDocument> {
    const item = await this.repository.findOne(workspaceId, id);
    if (!item) throw new NotFoundException(`Testimonial ${id} not found`);
    return item;
  }

  create(workspaceId: string, dto: CreateTestimonialDto) {
    return this.repository.create(workspaceId, dto);
  }

  async update(workspaceId: string, id: string, dto: UpdateTestimonialDto) {
    const item = await this.repository.update(workspaceId, id, dto);
    if (!item) throw new NotFoundException(`Testimonial ${id} not found`);
    return item;
  }

  async remove(workspaceId: string, id: string) {
    const item = await this.repository.softDelete(workspaceId, id);
    if (!item) throw new NotFoundException(`Testimonial ${id} not found`);
    return item;
  }

  findPublicForWorkspace(workspaceId: string): Promise<TestimonialDocument[]> {
    return this.repository.findPublic(workspaceId);
  }

  async reorder(workspaceId: string, dto: ReorderTestimonialsDto) {
    await this.repository.bulkReorder(workspaceId, dto.items);
    return this.findAll(workspaceId, {});
  }
}
