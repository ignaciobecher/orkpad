import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAiSettingsDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ example: 'http://ollama:11434' })
  @IsString()
  @IsOptional()
  ollamaBaseUrl?: string;

  @ApiPropertyOptional({ example: 'qwen2.5:7b' })
  @IsString()
  @IsOptional()
  chatModel?: string;

  @ApiPropertyOptional({ example: 'nomic-embed-text' })
  @IsString()
  @IsOptional()
  embedModel?: string;

  @ApiPropertyOptional({ example: 0.3 })
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @ApiPropertyOptional({ example: ['note', 'doc', 'task', 'project', 'invoice'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  indexTypes?: string[];
}
