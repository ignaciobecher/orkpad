import { PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSubscriptionPaymentDto } from './create-subscription-payment.dto';

export class UpdateSubscriptionPaymentDto extends PartialType(
  CreateSubscriptionPaymentDto,
) {
  @ApiPropertyOptional({ enum: ['pending', 'paid'] })
  @IsIn(['pending', 'paid'])
  @IsOptional()
  status?: 'pending' | 'paid';

  @ApiPropertyOptional({ example: '2026-04-30T12:00:00.000Z', nullable: true })
  @IsDateString()
  @IsOptional()
  paidAt?: string | null;
}
