import { PartialType } from '@nestjs/swagger';
import { CreateMarketingPromptDto } from './create-marketing-prompt.dto';

export class UpdateMarketingPromptDto extends PartialType(
  CreateMarketingPromptDto,
) {}
