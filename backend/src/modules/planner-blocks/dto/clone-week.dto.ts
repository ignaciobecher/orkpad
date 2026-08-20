import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloneWeekDto {
  @ApiProperty({
    example: '2026-05-20',
    description: 'Start date (Monday) of the source week',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fromWeekStart must be YYYY-MM-DD',
  })
  fromWeekStart: string;

  @ApiProperty({
    example: '2026-05-27',
    description: 'Start date (Monday) of the target week',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'toWeekStart must be YYYY-MM-DD' })
  toWeekStart: string;
}
