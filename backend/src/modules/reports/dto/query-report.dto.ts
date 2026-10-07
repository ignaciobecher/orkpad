import { IsOptional, IsISO8601 } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const toList = ({ value }: { value: unknown }) =>
  typeof value === 'string'
    ? value.split(',').map((s) => s.trim()).filter(Boolean)
    : value;

export class QueryReportDto {
  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsISO8601()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ example: '2026-10-31' })
  @IsISO8601()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({ description: 'IDs separados por coma' })
  @Transform(toList)
  @IsOptional()
  clientIds?: string[];

  @ApiPropertyOptional({ description: 'IDs separados por coma' })
  @Transform(toList)
  @IsOptional()
  projectIds?: string[];
}
