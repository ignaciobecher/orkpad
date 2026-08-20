import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillFocusDto {
  @ApiProperty({ example: 'Kubernetes' })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ example: 'devops' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Optional linked learning resource ids',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  resourceIds?: string[];
}
