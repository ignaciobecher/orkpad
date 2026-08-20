import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryInvoiceDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

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

  @ApiPropertyOptional({ enum: ['income', 'expense'] })
  @IsIn(['income', 'expense'])
  @IsOptional()
  type?: 'income' | 'expense';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
