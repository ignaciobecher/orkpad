import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryLearningResourceDto {
  @ApiPropertyOptional({
    enum: ['book', 'video', 'course', 'article', 'podcast'],
  })
  @IsIn(['book', 'video', 'course', 'article', 'podcast'])
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    enum: ['planned', 'in_progress', 'completed', 'abandoned'],
  })
  @IsIn(['planned', 'in_progress', 'completed', 'abandoned'])
  @IsOptional()
  status?: string;

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
