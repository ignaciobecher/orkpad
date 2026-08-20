import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBlockStatusDto {
  @ApiProperty({ enum: ['pending', 'in-progress', 'completed', 'skipped'] })
  @IsIn(['pending', 'in-progress', 'completed', 'skipped'])
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
}
