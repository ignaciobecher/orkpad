import {
  IsString,
  IsOptional,
  MaxLength,
  Max,
  IsIn,
  IsDateString,
  IsInt,
  Min,
  ValidateIf,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: ['active', 'on-hold', 'completed', 'archived'],
    default: 'active',
  })
  @IsIn(['active', 'on-hold', 'completed', 'archived'])
  @IsOptional()
  status?: 'active' | 'on-hold' | 'completed' | 'archived';

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Budget in cents', example: 500000 })
  @IsInt()
  @Min(0)
  @IsOptional()
  budget?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    enum: ['single', 'installments'],
    default: 'single',
    description: 'How the project budget is billed: full payment or installments (cuotas)',
  })
  @IsIn(['single', 'installments'])
  @IsOptional()
  billingType?: 'single' | 'installments';

  @ApiPropertyOptional({
    example: 3,
    description: 'Number of installments when billingType is installments (cuotas)',
  })
  @IsInt()
  @Min(1)
  @Max(60)
  @IsOptional()
  installmentsCount?: number;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59Z',
    description:
      'Expiry date for the public/private link. Null removes the expiry.',
    nullable: true,
  })
  @ValidateIf((o) => o.linkExpiresAt !== null)
  @IsDateString()
  @IsOptional()
  linkExpiresAt?: string | null;
}
