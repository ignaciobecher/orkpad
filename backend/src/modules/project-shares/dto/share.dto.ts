import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SharePermissionsDto {
  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  canCreate?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  canEdit?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  canComment?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  canUpload?: boolean;
}

export class CreateProjectShareDto {
  @ApiProperty({ example: 'Acceso cliente Acme' })
  @IsString()
  @MaxLength(80)
  label: string;

  @ApiProperty({ example: 'cliente-acme-4f2a' })
  @IsString()
  @MinLength(4)
  @MaxLength(40)
  @Matches(/^[a-z0-9][a-z0-9._-]*$/, {
    message: 'username solo minúsculas, números, punto, guion y guion bajo',
  })
  username: string;

  @ApiProperty({ example: 'Xk9#mQ2!' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  permissions?: SharePermissionsDto;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

export class UpdateProjectShareDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(80)
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({ description: 'Si se envía, reemplaza la contraseña' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  permissions?: SharePermissionsDto;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'null para sin vencimiento' })
  @IsOptional()
  expiresAt?: string | null;
}
