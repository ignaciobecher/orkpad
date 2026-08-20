import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BroadcastNotificationDto {
  @ApiProperty({ example: 'Nueva funcionalidad disponible' })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: 'Ya podés probar la nueva sección de Reportes.' })
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

  @ApiPropertyOptional({ example: '/app/reports' })
  @IsString()
  @IsOptional()
  link?: string;
}
