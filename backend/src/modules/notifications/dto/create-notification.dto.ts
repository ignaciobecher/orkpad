import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'user-id' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'New Invoice' })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: 'An invoice has been generated for your project.' })
  @IsString()
  @MaxLength(500)
  message: string;

  @ApiPropertyOptional({
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info',
  })
  @IsIn(['info', 'warning', 'success', 'error'])
  @IsOptional()
  type?: 'info' | 'warning' | 'success' | 'error' = 'info';

  @ApiPropertyOptional({ example: '/invoices/123' })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({ example: 'task-id-123' })
  @IsString()
  @IsOptional()
  refId?: string;

  @ApiPropertyOptional({ example: 'task' })
  @IsString()
  @IsOptional()
  refType?: string;
}
