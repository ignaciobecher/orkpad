import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  Max,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Acme Agency' })
  @IsString()
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({
    example: 'acme-agency',
    description: 'URL-safe slug (auto-generated if omitted)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(60)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug may only contain lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'Mi Agencia' })
  @IsString()
  @IsOptional()
  @MaxLength(80)
  displayName?: string;

  @ApiPropertyOptional({ description: 'ID de archivo del logo (ver POST /files)' })
  @IsString()
  @IsOptional()
  @MaxLength(64)
  logoFileId?: string;

  @ApiPropertyOptional({ example: '#5B4EFF' })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'primaryColor debe ser hex como #5B4EFF' })
  primaryColor?: string;

  @ApiPropertyOptional({ enum: ['dark', 'light'] })
  @IsIn(['dark', 'light'])
  @IsOptional()
  defaultTheme?: 'dark' | 'light';

  @ApiPropertyOptional({ example: 'contacto@miagencia.com' })
  @IsString()
  @IsOptional()
  @MaxLength(120)
  agencyEmail?: string;

  @ApiPropertyOptional({ example: '+54 9 261 123-4567' })
  @IsString()
  @IsOptional()
  @MaxLength(40)
  agencyPhone?: string;

  @ApiPropertyOptional({ example: 'Mendoza, Argentina' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  agencyAddress?: string;

  @ApiPropertyOptional({ example: 'www.miagencia.com' })
  @IsString()
  @IsOptional()
  @MaxLength(120)
  agencyWebsite?: string;

  @ApiPropertyOptional({ example: '20-12345678-9' })
  @IsString()
  @IsOptional()
  @MaxLength(40)
  taxId?: string;

  @ApiPropertyOptional({ example: 200, description: 'Tope de subida en MB (default 200)' })
  @IsInt()
  @Min(1)
  @Max(2048)
  @IsOptional()
  maxUploadMb?: number;
}
