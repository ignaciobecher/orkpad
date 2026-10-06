import { IsString, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePushSubscriptionDto {
  @ApiProperty({ example: 'https://push-service.example.com/send/...' })
  @IsUrl()
  endpoint: string;

  @ApiProperty({ example: 'BNcR...' })
  @IsString()
  p256dh: string;

  @ApiProperty({ example: 'tBHI...' })
  @IsString()
  auth: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0 ...' })
  @IsString()
  @IsOptional()
  userAgent?: string;
}
