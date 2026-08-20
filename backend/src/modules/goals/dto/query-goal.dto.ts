import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryGoalDto {
  @ApiPropertyOptional({ enum: ['habit', 'target', 'checklist'] })
  @IsIn(['habit', 'target', 'checklist'])
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    enum: ['active', 'paused', 'archived', 'completed', 'failed'],
  })
  @IsIn(['active', 'paused', 'archived', 'completed', 'failed'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: ['daily', 'weekly', 'monthly', 'none'] })
  @IsIn(['daily', 'weekly', 'monthly', 'none'])
  @IsOptional()
  period?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  limit?: number = 50;
}
