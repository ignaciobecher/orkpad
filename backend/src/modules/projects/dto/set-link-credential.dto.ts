import {
  IsString,
  IsArray,
  IsIn,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetLinkCredentialDto {
  @ApiProperty({ example: 'client-user', minLength: 3, maxLength: 50 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'strongPass123', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiPropertyOptional({
    enum: ['view', 'create-task'],
    isArray: true,
    default: ['view', 'create-task'],
    description: 'Permissions granted to the link credential',
  })
  @IsArray()
  @IsIn(['view', 'create-task'], { each: true })
  @IsOptional()
  permissions?: ('view' | 'create-task')[];
}
