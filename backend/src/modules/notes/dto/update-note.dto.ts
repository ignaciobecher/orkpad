import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateNoteDto } from './create-note.dto';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  @ApiPropertyOptional({ enum: ['active', 'done'] })
  @IsIn(['active', 'done'])
  @IsOptional()
  status?: 'active' | 'done';

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;
}
