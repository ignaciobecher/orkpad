import { PartialType } from '@nestjs/swagger';
import { CreatePlannerTemplateDto } from './create-planner-template.dto';

export class UpdatePlannerTemplateDto extends PartialType(
  CreatePlannerTemplateDto,
) {}
