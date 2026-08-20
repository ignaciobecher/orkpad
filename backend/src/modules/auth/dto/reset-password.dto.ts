import {
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'a3f2c1...' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewSecurePass123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '123456', required: false })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  totpToken?: string;
}
