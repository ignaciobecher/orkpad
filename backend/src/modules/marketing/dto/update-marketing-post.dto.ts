import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMarketingPostDto } from './create-marketing-post.dto';

export class UpdateMarketingPostDto extends PartialType(
  OmitType(CreateMarketingPostDto, ['network'] as const),
) {}
