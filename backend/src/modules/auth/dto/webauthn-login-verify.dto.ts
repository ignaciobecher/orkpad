import { IsEmail, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebAuthnLoginVerifyDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'AuthenticationResponseJSON from @simplewebauthn/browser',
  })
  @IsObject()
  response: Record<string, any>;
}
