import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryPlannerTaskDto {
  @ApiPropertyOptional({ description: 'Filter by block ID' })
  @IsString()
  @IsOptional()
  blockId?: string;

  @ApiPropertyOptional({ enum: ['pending', 'in-progress', 'completed'] })
  @IsIn(['pending', 'in-progress', 'completed'])
  @IsOptional()
  status?: string;

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
