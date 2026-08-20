import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: '64b1f2c3d4e5f6a7b8c9d0e1' })
  @IsString()
  clientId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty({ example: 'Pro Plan' })
  @IsString()
  @MaxLength(200)
  planName: string;

  @ApiPropertyOptional({ description: 'Price in cents', example: 4900 })
  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ enum: ['monthly', 'yearly'], default: 'monthly' })
  @IsIn(['monthly', 'yearly'])
  @IsOptional()
  billingCycle?: 'monthly' | 'yearly';

  @ApiPropertyOptional({
    enum: ['active', 'past_due', 'canceled'],
    default: 'active',
  })
  @IsIn(['active', 'past_due', 'canceled'])
  @IsOptional()
  status?: 'active' | 'past_due' | 'canceled';

  @ApiProperty({ example: '2025-07-01' })
  @IsDateString()
  nextBillingDate: string;
}
