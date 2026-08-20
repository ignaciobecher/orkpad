import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class PortfolioThemeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() primaryColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorScheme?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fontFamily?: string;
}

class PortfolioSeoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ogImageUrl?: string;
}

export class PortfolioSectionDto {
  @IsString() id: string;
  @IsString() type: string;
  @IsOptional() @IsBoolean() visible?: boolean;
  @IsOptional() @IsNumber() order?: number;
  @IsOptional() @IsObject() content?: Record<string, any>;
  @IsOptional() @IsObject() settings?: Record<string, any>;
}

export class SavePortfolioPageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PortfolioThemeDto)
  theme?: PortfolioThemeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PortfolioSeoDto)
  seo?: PortfolioSeoDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  sections?: any[];
}
