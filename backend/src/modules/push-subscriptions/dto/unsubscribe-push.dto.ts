import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnsubscribePushDto {
  @ApiProperty({ example: 'https://push-service.example.com/send/...' })
  @IsUrl()
  endpoint: string;
}
