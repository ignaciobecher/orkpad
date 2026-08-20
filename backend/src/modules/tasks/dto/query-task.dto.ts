import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTaskDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ['todo', 'in-progress', 'done', 'cancelled'] })
  @IsIn(['todo', 'in-progress', 'done', 'cancelled'])
  @IsOptional()
  status?: 'todo' | 'in-progress' | 'done' | 'cancelled';

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high', 'urgent'] })
  @IsIn(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ description: 'Filter by column ID' })
  @IsString()
  @IsOptional()
  columnId?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  limit?: number = 20;
}
