import {
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
  IsUrl,
  MaxLength,
} from 'class-validator';
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

export class CreateMarketingPostDto {
  @ApiProperty({ example: '5 errores comunes al cotizar proyectos freelance' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  copyText?: string;

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

  @ApiPropertyOptional({ example: '2026-06-20T15:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

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

  @ApiPropertyOptional({
    description: 'Notas de análisis: qué funcionó, qué no, qué probar',
  })
  @IsString()
  @IsOptional()
  analysisNotes?: string;
}
