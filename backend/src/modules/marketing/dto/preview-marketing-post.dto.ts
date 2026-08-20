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

export class PreviewMarketingPostRowDto {
  @ApiProperty({ example: 1 })
  rowIndex: number;

  @ApiProperty({ example: '2026-06-21' })
  dia: string;

  @ApiProperty({ enum: NETWORKS })
  red: 'linkedin' | 'instagram' | 'tiktok';

  @ApiProperty({ enum: FORMATS })
  formato:
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
  contenidoTitulo: string;

  @ApiPropertyOptional({ example: 'Descripción detallada del post...' })
  descripcion?: string;

  @ApiPropertyOptional({ enum: STATUSES, default: 'idea' })
  status?: 'idea' | 'borrador' | 'listo' | 'publicado';

  @ApiPropertyOptional({ example: 'https://example.com/image.png' })
  attachmentUrl?: string;

  @ApiPropertyOptional({ example: 'Notas de análisis' })
  analysisNotes?: string;

  @ApiPropertyOptional({ type: [String] })
  errors?: string[];

  @ApiProperty({ example: true })
  isValid: boolean;
}

export class PreviewMarketingPostResponseDto {
  @ApiProperty({ type: [PreviewMarketingPostRowDto] })
  rows: PreviewMarketingPostRowDto[];

  @ApiProperty({ example: 10 })
  totalRows: number;

  @ApiProperty({ example: 8 })
  validRows: number;

  @ApiProperty({ example: 2 })
  invalidRows: number;
}
