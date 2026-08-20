import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOutreachActivityDto {
  @ApiProperty({
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
  type:
    | 'cold_email'
    | 'proposal_sent'
    | 'call_booked'
    | 'follow_up'
    | 'linkedin_message'
    | 'other';

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MaxLength(150)
  targetName: string;

  @ApiPropertyOptional({ example: 'linkedin' })
  @IsString()
  @IsOptional()
  channel?: string;

  @ApiPropertyOptional({
    description: 'Optional link to an existing pipeline deal',
  })
  @IsString()
  @IsOptional()
  dealId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    enum: ['pending', 'replied', 'converted', 'no_response'],
    default: 'pending',
  })
  @IsIn(['pending', 'replied', 'converted', 'no_response'])
  @IsOptional()
  outcome?: 'pending' | 'replied' | 'converted' | 'no_response';
}
