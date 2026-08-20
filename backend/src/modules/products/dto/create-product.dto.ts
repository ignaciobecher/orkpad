import {
  IsString,
  IsOptional,
  IsInt,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Monthly Retainer' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Price in cents', example: 50000 })
  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ enum: ['active', 'archived'], default: 'active' })
  @IsIn(['active', 'archived'])
  @IsOptional()
  status?: 'active' | 'archived';

  @ApiPropertyOptional({
    enum: ['service', 'digital', 'physical'],
    default: 'service',
  })
  @IsIn(['service', 'digital', 'physical'])
  @IsOptional()
  type?: 'service' | 'digital' | 'physical';
}
