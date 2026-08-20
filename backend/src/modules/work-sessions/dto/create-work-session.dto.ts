import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkSessionDto {
  @ApiPropertyOptional({
    example: '2025-01-15T09:00:00Z',
    description: 'Si se omite, usa la hora actual',
  })
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ example: 'Día de reuniones y code review' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
