import {
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CURRENCIES } from '../../../common/constants/currencies';

class InvoiceItemDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price in cents', example: 10000 })
  @IsInt()
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    description: 'Total amount in cents (quantity × unitPrice)',
    example: 10000,
  })
  @IsInt()
  @Min(0)
  amount: number;
}

export class CreateInvoiceDto {
  @ApiPropertyOptional({ enum: ['income', 'expense'], default: 'income' })
  @IsIn(['income', 'expense'])
  @IsOptional()
  type?: 'income' | 'expense';

  @ApiPropertyOptional({ example: 'INV-001' })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Installment number within the project billing plan (cuota N)',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  installmentNumber?: number;

  @ApiPropertyOptional({
    description: 'Total installments of the project billing plan (cuotas M)',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  installmentCount?: number;

  @ApiPropertyOptional({
    enum: [
      'draft',
      'pending',
      'sent',
      'paid',
      'collected',
      'overdue',
      'cancelled',
    ],
    default: 'paid',
  })
  @IsIn([
    'draft',
    'pending',
    'sent',
    'paid',
    'collected',
    'overdue',
    'cancelled',
  ])
  @IsOptional()
  status?:
    | 'draft'
    | 'pending'
    | 'sent'
    | 'paid'
    | 'collected'
    | 'overdue'
    | 'cancelled';

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  issueDate: string;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsNumber()
  @IsOptional()
  total?: number;

  @ApiPropertyOptional({ type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  @IsOptional()
  items?: InvoiceItemDto[];

  @ApiPropertyOptional({
    description: 'Tax rate as a percentage (e.g. 21 = 21%)',
    example: 21,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  taxRate?: number;

  @ApiPropertyOptional({ enum: CURRENCIES, default: 'USD' })
  @IsIn(CURRENCIES as unknown as string[])
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: '2026-10-04',
    description: 'Actual collection date (fecha de cobro real)',
  })
  @IsDateString()
  @IsOptional()
  paidDate?: string;

  @ApiPropertyOptional({ example: 'Transferencia' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
