import {
  IsString,
  IsOptional,
  IsIn,
  IsArray,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const NETWORKS = ['linkedin', 'instagram', 'tiktok', 'general'] as const;

export class CreateMarketingPromptDto {
  @ApiProperty({ example: 'Hook para carrusel educativo' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({
    example: 'Escribí un hook de 2 líneas para un carrusel sobre...',
  })
  @IsString()
  promptText: string;

  @ApiPropertyOptional({ enum: NETWORKS, default: 'general' })
  @IsIn(NETWORKS)
  @IsOptional()
  network?: 'linkedin' | 'instagram' | 'tiktok' | 'general';

  @ApiPropertyOptional({ example: 'Hooks' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
