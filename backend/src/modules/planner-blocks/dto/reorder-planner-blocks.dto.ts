import { IsArray, IsString, ArrayMinSize, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderPlannerBlocksDto {
  @ApiProperty({
    type: [String],
    description: 'Block IDs in the desired order',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  ids: string[];

  @ApiProperty({ example: '2026-05-27' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;
}
