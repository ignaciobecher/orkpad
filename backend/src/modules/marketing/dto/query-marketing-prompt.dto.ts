import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

const NETWORKS = ['linkedin', 'instagram', 'tiktok', 'general'] as const;

export class QueryMarketingPromptDto {
  @ApiPropertyOptional({ enum: NETWORKS })
  @IsIn(NETWORKS)
  @IsOptional()
  network?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda por nombre, texto del prompt o tags',
  })
  @IsString()
  @IsOptional()
  search?: string;

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
