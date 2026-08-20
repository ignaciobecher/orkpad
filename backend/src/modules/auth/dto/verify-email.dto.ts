import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: 'a3f2c1...' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
