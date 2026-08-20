import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResourceDto {
  @ApiProperty({ example: 'Cómo fijar tu tarifa como freelancer' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'como-fijar-tarifa-freelancer' })
  @IsString()
  @MaxLength(200)
  slug: string;

  @ApiProperty({ description: 'Contenido en formato Markdown' })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    example:
      'Aprende a calcular tu tarifa ideal considerando gastos, impuestos y margen.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['tarifa', 'finanzas', 'negocio'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readTimeMinutes?: number;
}
