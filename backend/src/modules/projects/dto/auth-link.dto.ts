import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthLinkDto {
  @ApiProperty({ example: 'client-user' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'strongPass123' })
  @IsString()
  password: string;
}
