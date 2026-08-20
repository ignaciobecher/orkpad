import { PartialType } from '@nestjs/swagger';
import { CreateMarketingIdeaDto } from './create-marketing-idea.dto';

export class UpdateMarketingIdeaDto extends PartialType(
  CreateMarketingIdeaDto,
) {}
