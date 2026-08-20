import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { QueryTestimonialDto } from './dto/query-testimonial.dto';
import { ReorderTestimonialsDto } from './dto/reorder-testimonials.dto';

@ApiTags('Testimonials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly service: TestimonialsService) {}

  @Get()
  @ApiOperation({ summary: 'List all testimonials in the workspace' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryTestimonialDto,
  ) {
    return this.service.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a testimonial by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.service.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new testimonial' })
  create(
    @WorkspaceId() workspaceId: string,
    @Body() dto: CreateTestimonialDto,
  ) {
    return this.service.create(workspaceId, dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reordenar testimonios en bulk' })
  reorder(
    @WorkspaceId() workspaceId: string,
    @Body() dto: ReorderTestimonialsDto,
  ) {
    return this.service.reorder(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a testimonial' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTestimonialDto,
  ) {
    return this.service.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a testimonial' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.service.remove(workspaceId, id);
  }
}
