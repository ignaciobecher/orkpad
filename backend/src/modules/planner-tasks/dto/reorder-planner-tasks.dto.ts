import { IsArray, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderPlannerTasksDto {
  @ApiProperty({ type: [String], description: 'Task IDs in the desired order' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  ids: string[];

  @ApiProperty({ description: 'Parent block ID' })
  @IsString()
  blockId: string;
}
