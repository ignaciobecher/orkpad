import {
  IsOptional,
  IsString,
  IsIn,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

const NETWORKS = ['linkedin', 'instagram', 'tiktok'] as const;
const FORMATS = [
  'carousel',
  'reel',
  'article',
  'image',
  'video',
  'text',
  'story',
  'poll',
  'event',
] as const;
const STATUSES = ['idea', 'borrador', 'listo', 'publicado'] as const;

export class QueryMarketingPostDto {
  @ApiPropertyOptional({ enum: STATUSES })
  @IsIn(STATUSES)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: NETWORKS })
  @IsIn(NETWORKS)
  @IsOptional()
  network?: string;

  @ApiPropertyOptional({ enum: FORMATS })
  @IsIn(FORMATS)
  @IsOptional()
  format?: string;

  @ApiPropertyOptional({ description: 'Filtrar por idea de origen' })
  @IsString()
  @IsOptional()
  ideaId?: string;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsDateString()
  @IsOptional()
  to?: string;

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
