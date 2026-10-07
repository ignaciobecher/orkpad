import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QuerySubscriptionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({ enum: ['income', 'expense'] })
  @IsIn(['income', 'expense'])
  @IsOptional()
  type?: 'income' | 'expense';

  @ApiPropertyOptional({ enum: ['active', 'past_due', 'canceled'] })
  @IsIn(['active', 'past_due', 'canceled'])
  @IsOptional()
  status?: 'active' | 'past_due' | 'canceled';

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
