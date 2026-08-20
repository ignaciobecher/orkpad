import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CreateGoalDto } from './create-goal.dto';

export class UpdateGoalDto extends PartialType(CreateGoalDto) {
  @ApiPropertyOptional({
    enum: ['active', 'paused', 'archived', 'completed', 'failed'],
  })
  @IsIn(['active', 'paused', 'archived', 'completed', 'failed'])
  @IsOptional()
  status?: 'active' | 'paused' | 'archived' | 'completed' | 'failed';
}
