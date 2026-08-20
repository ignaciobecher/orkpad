import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryOutreachActivityDto {
  @ApiPropertyOptional({
    enum: [
      'cold_email',
      'proposal_sent',
      'call_booked',
      'follow_up',
      'linkedin_message',
      'other',
    ],
  })
  @IsIn([
    'cold_email',
    'proposal_sent',
    'call_booked',
    'follow_up',
    'linkedin_message',
    'other',
  ])
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    enum: ['pending', 'replied', 'converted', 'no_response'],
  })
  @IsIn(['pending', 'replied', 'converted', 'no_response'])
  @IsOptional()
  outcome?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  limit?: number = 50;
}
