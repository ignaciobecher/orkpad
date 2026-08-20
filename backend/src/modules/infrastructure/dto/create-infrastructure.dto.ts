import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInfrastructureResourceDto {
  @ApiProperty({ example: 'prod-db-01' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'AWS' })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({ example: 'RDS' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    enum: ['RUNNING', 'STOPPED', 'ERROR'],
    default: 'RUNNING',
  })
  @IsIn(['RUNNING', 'STOPPED', 'ERROR'])
  @IsOptional()
  status?: 'RUNNING' | 'STOPPED' | 'ERROR';

  @ApiPropertyOptional({ description: 'Monthly cost in cents', example: 5000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;
}
