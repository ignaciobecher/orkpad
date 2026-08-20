import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class SendFollowUpDto {
  @ApiProperty({ example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  @IsMongoId()
  userId: string;
}
