import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddWeeklyMetricDto {
  @ApiProperty()
  @IsInt()
  weekNumber: number;

  @ApiProperty()
  @IsInt()
  year: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  postsPublished: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  connectionsRequested?: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  messagesSent: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  responsesReceived: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  callsBooked: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  clientsClosed: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  topPerformingPost?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
