import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LogLearningProgressDto {
  @ApiProperty({
    example: 20,
    description: 'Units logged for today (pages/minutes/episodes)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  unitsLogged: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;
}
