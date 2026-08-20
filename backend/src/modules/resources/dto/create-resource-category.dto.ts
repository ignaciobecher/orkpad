import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResourceCategoryDto {
  @ApiProperty({ example: 'Finanzas para freelancers' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'finanzas-freelancers' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: 'chart-bar' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
