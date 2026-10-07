import {
  IsString,
  IsOptional,
  IsIn,
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
}
