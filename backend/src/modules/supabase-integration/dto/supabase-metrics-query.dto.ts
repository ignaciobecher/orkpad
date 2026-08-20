import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SupabaseMetricsQueryDto {
  @ApiPropertyOptional({
    description: 'Number of hours of history to return (default: 24, max: 168)',
    default: 24,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(168)
  hours?: number;
}
