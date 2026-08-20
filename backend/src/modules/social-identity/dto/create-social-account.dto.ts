import {
  IsString,
  IsIn,
  IsOptional,
  IsArray,
  IsInt,
  IsNumber,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const PLATFORMS = [
  'tiktok',
  'linkedin',
  'instagram',
  'twitter',
  'youtube',
  'email',
] as const;
const PURPOSES = ['clients', 'founders', 'devs', 'saas', 'mixed'] as const;

class IdentityDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bannerDescription?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  linkInBio?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  positioning?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  uniqueAngle?: string;
}

class AudienceDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  primaryProfile?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ageRange?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  painPoints?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  desires?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  whereLive?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notFor?: string[];
}

export class ContentPillarDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  frequency?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  examples?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  callToAction?: string;
}

class StyleRulesDto {
  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  doList?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dontList?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  toneWords?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  format?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  videoStyle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  postLength?: string;
}

export class MessageTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  useCase?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  followUpDays?: number;
}

class ProspectingDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  weeklyGoal?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetIndustries?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetRoles?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetCities?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualificationCriteria?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  disqualificationCriteria?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchStrategy?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  conversionGoal?: string;
}

export class CreateSocialAccountDto {
  @ApiProperty({ example: 'Mi estudio — TikTok' })
  @IsString()
  @MaxLength(120)
  accountName: string;

  @ApiProperty({ enum: PLATFORMS })
  @IsIn(PLATFORMS)
  platform: (typeof PLATFORMS)[number];

  @ApiProperty({ example: '@tuusuario' })
  @IsString()
  handle: string;

  @ApiProperty({ enum: PURPOSES })
  @IsIn(PURPOSES)
  purpose: (typeof PURPOSES)[number];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  purposeDescription?: string;

  @ApiPropertyOptional({ type: IdentityDto })
  @ValidateNested()
  @Type(() => IdentityDto)
  @IsOptional()
  identity?: IdentityDto;

  @ApiPropertyOptional({ type: AudienceDto })
  @ValidateNested()
  @Type(() => AudienceDto)
  @IsOptional()
  audience?: AudienceDto;

  @ApiPropertyOptional({ type: [ContentPillarDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentPillarDto)
  @IsOptional()
  contentPillars?: ContentPillarDto[];

  @ApiPropertyOptional({ type: StyleRulesDto })
  @ValidateNested()
  @Type(() => StyleRulesDto)
  @IsOptional()
  styleRules?: StyleRulesDto;

  @ApiPropertyOptional({ type: [MessageTemplateDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageTemplateDto)
  @IsOptional()
  messageTemplates?: MessageTemplateDto[];

  @ApiPropertyOptional({ type: ProspectingDto })
  @ValidateNested()
  @Type(() => ProspectingDto)
  @IsOptional()
  prospecting?: ProspectingDto;

  @ApiPropertyOptional({ example: '#FF3B5C' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: '🎵' })
  @IsString()
  @IsOptional()
  emoji?: string;
}
