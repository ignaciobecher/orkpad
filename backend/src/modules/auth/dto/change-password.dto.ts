import { IsOptional, IsString, Length, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  totpToken?: string;
}
