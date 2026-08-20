import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  IsArray,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLearningResourceDto {
  @ApiProperty({ example: 'Designing Data-Intensive Applications' })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiProperty({ enum: ['book', 'video', 'course', 'article', 'podcast'] })
  @IsIn(['book', 'video', 'course', 'article', 'podcast'])
  type: 'book' | 'video' | 'course' | 'article' | 'podcast';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @ApiPropertyOptional({
    description: 'Total pages/minutes/episodes, if known',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  totalUnits?: number;

  @ApiPropertyOptional({
    enum: ['pages', 'minutes', 'episodes', 'chapters', 'percent'],
    default: 'pages',
  })
  @IsIn(['pages', 'minutes', 'episodes', 'chapters', 'percent'])
  @IsOptional()
  unit?: 'pages' | 'minutes' | 'episodes' | 'chapters' | 'percent';

  @ApiPropertyOptional({
    description: 'Minimum units to log per day to keep the streak',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  dailyGoalUnits?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;
}
