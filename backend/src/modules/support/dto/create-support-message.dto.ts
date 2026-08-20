import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupportMessageDto {
  @ApiProperty({
    example: '¿Cómo invito a un miembro del equipo?',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}
