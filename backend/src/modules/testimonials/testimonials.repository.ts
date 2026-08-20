import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Testimonial, TestimonialDocument } from './testimonials.schema';

@Injectable()
export class TestimonialsRepository extends BaseRepository<TestimonialDocument> {
  constructor(
    @InjectModel(Testimonial.name)
    private readonly testimonialModel: Model<TestimonialDocument>,
  ) {
    super(testimonialModel);
  }

  async findPublic(workspaceId: string): Promise<TestimonialDocument[]> {
    return this.testimonialModel
      .find({ workspaceId, isPublic: true, isDeleted: false })
      .sort({ order: 1, createdAt: -1 })
      .lean()
      .exec();
  }

  async bulkReorder(
    workspaceId: string,
    items: { id: string; order: number }[],
  ): Promise<void> {
    const ops = items.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id, workspaceId, isDeleted: false },
        update: { $set: { order } },
      },
    }));
    if (ops.length > 0) {
      await this.testimonialModel.bulkWrite(ops);
    }
  }
}
