import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskCommentDto {
  @ApiProperty({ example: 'Revisar esto con el cliente @juan' })
  @IsString()
  @MaxLength(5000)
  text: string;

  @ApiPropertyOptional({ description: 'User IDs mencionados' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mentions?: string[];
}
