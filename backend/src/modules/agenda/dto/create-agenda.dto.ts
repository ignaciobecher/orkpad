import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Team sync' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-06-01T10:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiPropertyOptional({ example: '2025-06-01T11:00:00Z' })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attendees?: string[];

  @ApiPropertyOptional({
    enum: ['meeting', 'reminder', 'task', 'appointment', 'shift'],
    default: 'meeting',
  })
  @IsIn(['meeting', 'reminder', 'task', 'appointment', 'shift'])
  @IsOptional()
  type?: 'meeting' | 'reminder' | 'task' | 'appointment' | 'shift';

  @ApiPropertyOptional({ example: '#5B4EFF' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  links?: { entityType: string; entityId: string; title: string }[];
}
