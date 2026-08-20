import {
  IsString,
  IsOptional,
  IsIn,
  IsArray,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const NETWORKS = ['linkedin', 'instagram', 'tiktok'] as const;
const STATUSES = ['idea', 'borrador', 'listo', 'publicado'] as const;

export class CreateMarketingIdeaDto {
  @ApiProperty({ example: 'Serie sobre productividad para freelancers' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: NETWORKS, isArray: true })
  @IsArray()
  @IsIn(NETWORKS, { each: true })
  @IsOptional()
  networks?: ('linkedin' | 'instagram' | 'tiktok')[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: '2026-06-15' })
  @IsDateString()
  @IsOptional()
  estimatedDate?: string;

  @ApiPropertyOptional({ enum: STATUSES, default: 'idea' })
  @IsIn(STATUSES)
  @IsOptional()
  status?: 'idea' | 'borrador' | 'listo' | 'publicado';
}
