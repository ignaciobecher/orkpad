import {
  IsString,
  IsOptional,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTestimonialDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MaxLength(120)
  clientName: string;

  @ApiPropertyOptional({ example: 'CEO at Acme Corp' })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  clientRole?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientAvatarUrl?: string;

  @ApiProperty({
    example: 'Working with this freelancer was a fantastic experience.',
  })
  @IsString()
  @MaxLength(500)
  content: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
