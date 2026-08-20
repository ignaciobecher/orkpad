import {
  IsString,
  IsOptional,
  IsIn,
  IsObject,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CampaignTemplateDto {
  @ApiPropertyOptional({
    example: 'Hola, tenemos una propuesta para tu negocio',
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ example: 'Hola {{name}}, me puse en contacto porque...' })
  @IsString()
  body: string;
}

export class CreateLeadCampaignDto {
  @ApiProperty({ example: 'Ferreterías sin web — Mayo 2025' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: ['email', 'whatsapp', 'manual'],
    default: 'email',
  })
  @IsIn(['email', 'whatsapp', 'manual'])
  @IsOptional()
  type?: 'email' | 'whatsapp' | 'manual';

  @ApiProperty({ type: CampaignTemplateDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CampaignTemplateDto)
  template: CampaignTemplateDto;
}
