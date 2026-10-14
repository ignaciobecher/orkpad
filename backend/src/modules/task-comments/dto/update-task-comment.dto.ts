import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskCommentDto {
  @ApiProperty({ example: 'Texto editado' })
  @IsString()
  @MaxLength(5000)
  @IsOptional()
  text?: string;
}
