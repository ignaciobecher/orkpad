import {
  IsOptional,
  IsString,
  IsIn,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryLeadDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: ['new', 'contacted', 'qualified', 'disqualified', 'converted'],
  })
  @IsIn(['new', 'contacted', 'qualified', 'disqualified', 'converted'])
  @IsOptional()
  status?: 'new' | 'contacted' | 'qualified' | 'disqualified' | 'converted';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchId?: string;

  @ApiPropertyOptional({ enum: ['manual', 'import'] })
  @IsIn(['manual', 'import'])
  @IsOptional()
  source?: 'manual' | 'import';

  @ApiPropertyOptional({
    description: 'Filter leads by whether they have an email address',
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  hasEmail?: boolean;

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
