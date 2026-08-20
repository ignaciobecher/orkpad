import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const PLATFORMS = [
  'tiktok',
  'linkedin',
  'instagram',
  'twitter',
  'youtube',
  'email',
] as const;

export class DuplicateSocialAccountDto {
  @ApiProperty({ enum: PLATFORMS })
  @IsIn(PLATFORMS)
  platform: (typeof PLATFORMS)[number];

  @ApiProperty()
  @IsString()
  accountName: string;
}
