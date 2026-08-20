import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactFormDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'I need a website built for my business' })
  @IsString()
  @MaxLength(1000)
  message: string;

  @ApiPropertyOptional({ example: 'New Project Inquiry' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  subject?: string;
}
