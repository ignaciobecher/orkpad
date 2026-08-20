import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionPaymentDto {
  @ApiProperty({ example: 'Abril 2026' })
  @IsString()
  @MaxLength(100)
  periodLabel: string;

  @ApiProperty({ example: '2026-04-30' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ description: 'Amount in cents', example: 4900 })
  @IsInt()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'Paid via bank transfer' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}
