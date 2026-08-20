import {
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  IsArray,
  IsNumber,
  MaxLength,
  ValidateNested,
  IsHexColor,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class ChecklistItemDto {
  @IsString()
  id: string;

  @IsString()
  @MaxLength(500)
  text: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class CreateNoteDto {
  @ApiPropertyOptional({ example: 'Fix bug en login' })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: '# Bug\nEl login falla cuando...' })
  @IsString()
  @MaxLength(10000)
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ enum: ['note', 'checklist'], default: 'note' })
  @IsIn(['note', 'checklist'])
  @IsOptional()
  type?: 'note' | 'checklist';

  @ApiPropertyOptional({ example: '#EF4444' })
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: ['bug', 'urgente'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  @IsOptional()
  checklist?: ChecklistItemDto[];

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;
}
