import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QuerySocialAccountDto {
  @ApiPropertyOptional({
    enum: ['tiktok', 'linkedin', 'instagram', 'twitter', 'youtube', 'email'],
  })
  @IsIn(['tiktok', 'linkedin', 'instagram', 'twitter', 'youtube', 'email'])
  @IsOptional()
  platform?: string;

  @ApiPropertyOptional({
    enum: ['clients', 'founders', 'devs', 'saas', 'mixed'],
  })
  @IsIn(['clients', 'founders', 'devs', 'saas', 'mixed'])
  @IsOptional()
  purpose?: string;

  @ApiPropertyOptional({ enum: ['active', 'paused', 'archived'] })
  @IsIn(['active', 'paused', 'archived'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
