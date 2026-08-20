import {
  IsOptional,
  IsString,
  IsIn,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryPlannerBlockDto {
  @ApiPropertyOptional({
    example: '2026-05-27',
    description: 'Filter by exact date (YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateFrom must be YYYY-MM-DD' })
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateTo must be YYYY-MM-DD' })
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({
    enum: ['pending', 'in-progress', 'completed', 'skipped'],
  })
  @IsIn(['pending', 'in-progress', 'completed', 'skipped'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  limit?: number = 100;
}
