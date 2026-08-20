import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsRepository } from './testimonials.repository';
import { Testimonial, TestimonialSchema } from './testimonials.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Testimonial.name, schema: TestimonialSchema },
    ]),
  ],
  controllers: [TestimonialsController],
  providers: [TestimonialsService, TestimonialsRepository],
  exports: [TestimonialsService],
})
export class TestimonialsModule {}
