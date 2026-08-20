import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
  IsDateString,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuoteLineItemDto {
  @ApiProperty({ example: 'Web design' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  quantity?: number = 1;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'hs' })
  @IsString()
  @IsOptional()
  unit?: string;
}

export class QuoteSectionDto {
  @ApiProperty({ example: 'Diseño UI/UX' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [QuoteLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLineItemDto)
  items: QuoteLineItemDto[];
}

export class CreateQuoteDto {
  @ApiProperty({ example: 'Presupuesto Proyecto Web Acme Corp' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Q-2024-001' })
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

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  taskIds?: string[];

  @ApiPropertyOptional({
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
  })
  @IsIn(['draft', 'sent', 'accepted', 'rejected', 'expired'])
  @IsOptional()
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  freelancerName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  freelancerEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  freelancerPhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  freelancerAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  freelancerWebsite?: string;

  @ApiPropertyOptional({ type: [QuoteSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteSectionDto)
  @IsOptional()
  sections?: QuoteSectionDto[];

  @ApiPropertyOptional({ type: [QuoteLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLineItemDto)
  @IsOptional()
  items?: QuoteLineItemDto[];

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercent?: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  validityNote?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  scope?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deliverables?: string;
}
