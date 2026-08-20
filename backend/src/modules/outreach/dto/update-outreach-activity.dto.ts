import { PartialType } from '@nestjs/swagger';
import { CreateOutreachActivityDto } from './create-outreach-activity.dto';

export class UpdateOutreachActivityDto extends PartialType(
  CreateOutreachActivityDto,
) {}
