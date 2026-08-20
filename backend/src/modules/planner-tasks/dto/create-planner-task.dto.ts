import {
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  IsNumber,
  IsArray,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ChecklistItemDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

class AttachmentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  type?: string;
}

export class CreatePlannerTaskDto {
  @ApiProperty()
  @IsString()
  blockId: string;

  @ApiProperty({ example: 'Terminar el backend de pagos' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'], default: 'medium' })
  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({ enum: ['pending', 'in-progress', 'completed'] })
  @IsIn(['pending', 'in-progress', 'completed'])
  @IsOptional()
  status?: 'pending' | 'in-progress' | 'completed';

  @ApiPropertyOptional({ default: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedMinutes?: number;

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

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  links?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [ChecklistItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  @IsOptional()
  checklist?: ChecklistItemDto[];

  @ApiPropertyOptional({ type: [AttachmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];
}
