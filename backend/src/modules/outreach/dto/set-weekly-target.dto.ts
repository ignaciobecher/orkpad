import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SetWeeklyTargetDto {
  @ApiProperty({
    example: 10,
    description: 'Number of outreach activities to log this week',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  targetCount: number;
}
