import {
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
  IsUrl,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class ImportMarketingPostRowDto {
  @ApiProperty({ example: '2026-06-21' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ enum: NETWORKS })
  @IsIn(NETWORKS)
  network: 'linkedin' | 'instagram' | 'tiktok';

  @ApiProperty({ enum: FORMATS })
  @IsIn(FORMATS)
  format:
    | 'carousel'
    | 'reel'
    | 'article'
    | 'image'
    | 'video'
    | 'text'
    | 'story'
    | 'poll'
    | 'event';

  @ApiProperty({ example: '5 errores comunes al cotizar' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Descripción detallada del post...' })
  @IsString()
  @IsOptional()
  copyText?: string;

  @ApiPropertyOptional({ enum: STATUSES, default: 'idea' })
  @IsIn(STATUSES)
  @IsOptional()
  status?: 'idea' | 'borrador' | 'listo' | 'publicado';

  @ApiPropertyOptional({ description: 'ID de la idea de origen' })
  @IsString()
  @IsOptional()
  ideaId?: string;

  @ApiPropertyOptional({
    description: 'URL del archivo adjunto o recurso visual',
  })
  @IsUrl()
  @IsOptional()
  attachmentUrl?: string;

  @ApiPropertyOptional({ description: 'Notas de análisis' })
  @IsString()
  @IsOptional()
  analysisNotes?: string;
}

export class ImportMarketingPostsDto {
  @ApiProperty({ type: [ImportMarketingPostRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportMarketingPostRowDto)
  posts: ImportMarketingPostRowDto[];
}
