import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CreateLearningResourceDto } from './create-learning-resource.dto';

export class UpdateLearningResourceDto extends PartialType(
  CreateLearningResourceDto,
) {
  @ApiPropertyOptional({
    enum: ['planned', 'in_progress', 'completed', 'abandoned'],
  })
  @IsIn(['planned', 'in_progress', 'completed', 'abandoned'])
  @IsOptional()
  status?: 'planned' | 'in_progress' | 'completed' | 'abandoned';
}
