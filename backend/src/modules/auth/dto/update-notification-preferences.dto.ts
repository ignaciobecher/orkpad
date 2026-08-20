import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({
    description:
      'Receive notification when a client adds a task via public link',
  })
  @IsBoolean()
  @IsOptional()
  publicTaskCreated?: boolean;
}
