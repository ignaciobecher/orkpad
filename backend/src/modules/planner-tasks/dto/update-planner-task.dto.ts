import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePlannerTaskDto } from './create-planner-task.dto';

export class UpdatePlannerTaskDto extends PartialType(
  OmitType(CreatePlannerTaskDto, ['blockId'] as const),
) {}
