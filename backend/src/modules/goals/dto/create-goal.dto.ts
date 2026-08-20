import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  IsDateString,
  IsArray,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGoalDto {
  @ApiProperty({ example: 'Enviar 10 mails de prospección' })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ['habit', 'target', 'checklist'] })
  @IsIn(['habit', 'target', 'checklist'])
  type: 'habit' | 'target' | 'checklist';

  @ApiProperty({ enum: ['daily', 'weekly', 'monthly', 'none'] })
  @IsIn(['daily', 'weekly', 'monthly', 'none'])
  period: 'daily' | 'weekly' | 'monthly' | 'none';

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  targetCount?: number;

  @ApiPropertyOptional({ example: 'mails' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: "Required when type is 'target'" })
  @ValidateIf((o) => o.type === 'target')
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'IANA timezone, e.g. America/Argentina/Buenos_Aires',
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
