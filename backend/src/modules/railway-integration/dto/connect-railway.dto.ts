import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConnectRailwayDto {
  @ApiProperty({
    description: 'Railway personal API token',
    example: 'rly_xxxxxxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  apiToken: string;

  @ApiPropertyOptional({
    description: 'Railway team ID (optional)',
    example: 'team_xxxxxxxx',
  })
  @IsString()
  @IsOptional()
  teamId?: string;
}
