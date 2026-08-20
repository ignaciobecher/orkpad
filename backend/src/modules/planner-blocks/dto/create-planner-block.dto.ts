import {
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  IsNumber,
  IsArray,
  MaxLength,
  Matches,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePlannerBlockDto {
  @ApiProperty({ example: '2026-05-27' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be HH:mm' })
  startTime: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be HH:mm' })
  endTime: string;

  @ApiProperty({ example: 'Deep Work' })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'work' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'], default: 'medium' })
  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({
    enum: ['pending', 'in-progress', 'completed', 'skipped'],
  })
  @IsIn(['pending', 'in-progress', 'completed', 'skipped'])
  @IsOptional()
  status?: 'pending' | 'in-progress' | 'completed' | 'skipped';

  @ApiPropertyOptional({ example: '#2563EB' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ example: 'America/Argentina/Buenos_Aires' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isFocusBlock?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
