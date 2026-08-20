import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

const NETWORKS = ['linkedin', 'instagram', 'tiktok'] as const;
const STATUSES = ['idea', 'borrador', 'listo', 'publicado'] as const;

export class QueryMarketingIdeaDto {
  @ApiPropertyOptional({ enum: STATUSES })
  @IsIn(STATUSES)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: NETWORKS })
  @IsIn(NETWORKS)
  @IsOptional()
  network?: string;

  @ApiPropertyOptional({ description: 'Búsqueda por título o descripción' })
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
