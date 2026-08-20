import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteTaskDto {
  @ApiPropertyOptional({
    description: 'If true, sends a completion email to the project client',
  })
  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean;

  @ApiPropertyOptional({
    description: 'Mark task as completed or uncompleted',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
