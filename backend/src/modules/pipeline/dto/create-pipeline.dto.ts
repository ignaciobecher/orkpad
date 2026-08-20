import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDealDto {
  @ApiProperty({ example: 'Website Redesign' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Deal value in cents', example: 500000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    enum: ['lead', 'contacted', 'proposal', 'won', 'lost'],
    default: 'lead',
  })
  @IsIn(['lead', 'contacted', 'proposal', 'won', 'lost'])
  @IsOptional()
  stage?: 'lead' | 'contacted' | 'proposal' | 'won' | 'lost';

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ description: 'Notas internas sobre el deal' })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  notes?: string;
}
