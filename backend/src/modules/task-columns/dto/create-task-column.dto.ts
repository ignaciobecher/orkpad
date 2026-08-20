import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskColumnDto {
  @ApiProperty({ example: '64b1f2c3d4e5f6a7b8c9d0e1' })
  @IsString()
  projectId: string;

  @ApiProperty({ example: 'En Progreso' })
  @IsString()
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({ example: '#5B4EFF' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
