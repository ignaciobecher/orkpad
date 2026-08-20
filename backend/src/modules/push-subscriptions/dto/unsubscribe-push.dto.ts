import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnsubscribePushDto {
  @ApiProperty({ example: 'https://fcm.googleapis.com/fcm/send/...' })
  @IsUrl()
  endpoint: string;
}
