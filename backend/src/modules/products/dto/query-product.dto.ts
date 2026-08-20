import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryProductDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ['active', 'archived'] })
  @IsIn(['active', 'archived'])
  @IsOptional()
  status?: 'active' | 'archived';

  @ApiPropertyOptional({ enum: ['service', 'digital', 'physical'] })
  @IsIn(['service', 'digital', 'physical'])
  @IsOptional()
  type?: 'service' | 'digital' | 'physical';

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
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
