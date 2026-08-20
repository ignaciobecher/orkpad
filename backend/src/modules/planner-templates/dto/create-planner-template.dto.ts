import {
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  IsArray,
  MaxLength,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class TemplateTaskDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ default: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedMinutes?: number;
}

class TemplateBlockDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ default: 'work' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ default: '#2563EB' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'], default: 'medium' })
  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isFocusBlock?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ type: [TemplateTaskDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateTaskDto)
  @IsOptional()
  tasks?: TemplateTaskDto[];
}

export class CreatePlannerTemplateDto {
  @ApiProperty({ example: 'Rutina de freelancer' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['day', 'week', 'month'], default: 'day' })
  @IsIn(['day', 'week', 'month'])
  @IsOptional()
  type?: 'day' | 'week' | 'month';

  @ApiPropertyOptional({ example: 'freelancer' })
  @IsString()
  @IsOptional()
  profession?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ type: [TemplateBlockDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateBlockDto)
  @IsOptional()
  blocks?: TemplateBlockDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
