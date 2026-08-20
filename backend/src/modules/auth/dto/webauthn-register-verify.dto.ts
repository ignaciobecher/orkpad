import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebAuthnRegisterVerifyDto {
  @ApiProperty({
    description: 'RegistrationResponseJSON from @simplewebauthn/browser',
  })
  @IsObject()
  response: Record<string, any>;

  @ApiPropertyOptional({ example: 'iPhone de trabajo' })
  @IsOptional()
  @IsString()
  deviceName?: string;
}
