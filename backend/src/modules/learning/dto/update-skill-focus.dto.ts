import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreateSkillFocusDto } from './create-skill-focus.dto';

export class UpdateSkillFocusDto extends PartialType(CreateSkillFocusDto) {
  @ApiPropertyOptional({ enum: ['active', 'completed', 'abandoned'] })
  @IsIn(['active', 'completed', 'abandoned'])
  @IsOptional()
  status?: 'active' | 'completed' | 'abandoned';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  outcomeNotes?: string;
}
