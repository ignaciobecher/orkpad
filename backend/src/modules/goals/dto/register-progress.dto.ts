import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class IncrementProgressDto {
  @ApiPropertyOptional({
    default: 1,
    description: 'Can be negative to undo an increment',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  amount?: number;
}

export class SetProgressDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentCount: number;
}
