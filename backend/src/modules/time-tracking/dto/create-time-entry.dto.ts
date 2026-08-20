import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimeEntryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  taskId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-01-15T09:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiPropertyOptional({ example: '2025-01-15T11:30:00Z' })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  billable?: boolean;

  @ApiPropertyOptional({ description: 'Hourly rate in cents', example: 10000 })
  @IsInt()
  @Min(0)
  @IsOptional()
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'Work session this entry belongs to' })
  @IsString()
  @IsOptional()
  sessionId?: string;
}
