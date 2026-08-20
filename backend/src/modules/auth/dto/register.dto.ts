import {
  IsBoolean,
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsAllowedRegistrationEmail } from '../validators/reserved-email.validator';

export class RegisterDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  @IsAllowedRegistrationEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  termsAccepted: boolean;
}
