import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class SendMarketingDto {
  @ApiProperty({ example: 'academia', enum: ['academia'] })
  @IsString()
  @IsIn(['academia'])
  templateId: string;
}
