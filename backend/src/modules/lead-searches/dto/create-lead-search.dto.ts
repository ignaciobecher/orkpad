import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsIn,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadSearchDto {
  @ApiProperty({ example: 'ferreterías' })
  @IsString()
  @MaxLength(200)
  query: string;

  @ApiProperty({ example: 'Villa Mercedes, San Luis' })
  @IsString()
  @MaxLength(200)
  location: string;

  @ApiPropertyOptional({ example: 'ferreterías y pinturerías' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ type: [String], example: ['herramientas', 'pintura'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  maxResults?: number = 20;

  @ApiPropertyOptional({ type: [String], enum: ['google_maps', 'web'] })
  @IsArray()
  @IsIn(['google_maps', 'web'], { each: true })
  @IsOptional()
  sources?: ('google_maps' | 'web')[] = ['google_maps'];
}
