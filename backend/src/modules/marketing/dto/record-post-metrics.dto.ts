import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RecordPostMetricsDto {
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() impressions?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() views?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() reach?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() likes?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() reactions?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() comments?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() shares?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() reposts?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() saves?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() clicks?: number;
  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  profileVisits?: number;
  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  newFollowers?: number;
  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  avgWatchTimeSeconds?: number;

  @ApiPropertyOptional({
    description: 'Qué funcionó, qué no, qué probar la próxima',
  })
  @IsString()
  @IsOptional()
  analysisNotes?: string;
}
