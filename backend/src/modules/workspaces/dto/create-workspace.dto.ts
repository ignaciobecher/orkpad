import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsBoolean,
  ValidateNested,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SocialLinksDto {
  @ApiPropertyOptional({ example: 'https://mysite.com' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/me' })
  @IsString()
  @IsOptional()
  linkedin?: string;

  @ApiPropertyOptional({ example: 'https://twitter.com/me' })
  @IsString()
  @IsOptional()
  twitter?: string;

  @ApiPropertyOptional({ example: 'https://github.com/me' })
  @IsString()
  @IsOptional()
  github?: string;
}

export class PortfolioStatsDto {
  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  yearsExperience?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  completedProjects?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  happyClients?: number;
}

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

  @ApiPropertyOptional({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  headline?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  publicProfile?: boolean;

  @ApiPropertyOptional({ type: () => SocialLinksDto })
  @ValidateNested()
  @Type(() => SocialLinksDto)
  @IsOptional()
  socialLinks?: SocialLinksDto;

  @ApiPropertyOptional({
    type: [String],
    example: ['React', 'Node.js', 'MongoDB'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  availableForWork?: boolean;

  @ApiPropertyOptional({ maxLength: 80, example: 'Disponible desde julio' })
  @IsString()
  @MaxLength(80)
  @IsOptional()
  availabilityNote?: string;

  @ApiPropertyOptional({ type: () => PortfolioStatsDto })
  @ValidateNested()
  @Type(() => PortfolioStatsDto)
  @IsOptional()
  portfolioStats?: PortfolioStatsDto;
}
