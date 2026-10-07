import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty({ example: '¿Qué falta cobrar este mes?' })
  @IsString()
  @MaxLength(4000)
  message: string;

  @ApiPropertyOptional({ description: 'Continúa esta conversación; si se omite se crea una nueva' })
  @IsString()
  @IsOptional()
  conversationId?: string;

  @ApiPropertyOptional({ description: 'Limita el contexto a un proyecto' })
  @IsString()
  @IsOptional()
  projectId?: string;
}
