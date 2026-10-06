import {
  IsString,
  IsOptional,
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
}
