import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ example: 'client-id-abc123' })
  @IsString()
  clientId: string;

  @ApiPropertyOptional({ example: 'project-id-xyz456' })
  @IsString()
  @IsOptional()
  projectId?: string;
}
