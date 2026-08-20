import {
  IsString,
  IsOptional,
  MaxLength,
  IsIn,
  IsDateString,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Design landing page mockup' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({
    enum: ['todo', 'in-progress', 'done', 'cancelled'],
    default: 'todo',
  })
  @IsIn(['todo', 'in-progress', 'done', 'cancelled'])
  @IsOptional()
  status?: 'todo' | 'in-progress' | 'done' | 'cancelled';

  @ApiPropertyOptional({
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  @IsIn(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @ApiPropertyOptional({ example: '2025-06-30' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Column ID for Kanban board' })
  @IsString()
  @IsOptional()
  columnId?: string;

  @ApiPropertyOptional({
    description: 'Position order within the column',
    example: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: 'Checklist items' })
  @IsArray()
  @IsOptional()
  checklist?: { text: string; completed?: boolean }[];

  @ApiPropertyOptional({ description: 'Task labels' })
  @IsArray()
  @IsOptional()
  labels?: { id: string; name: string; color: string }[];

  @ApiPropertyOptional({ description: 'Task attachments' })
  @IsArray()
  @IsOptional()
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
  }[];
}
