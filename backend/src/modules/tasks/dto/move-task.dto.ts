import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MoveTaskDto {
  @ApiProperty({ description: 'Target column ID' })
  @IsString()
  columnId: string;

  @ApiPropertyOptional({
    description: 'New position within the column',
    example: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
