import {
  IsString,
  IsEmail,
  IsOptional,
  IsIn,
  IsNumber,
  IsArray,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({ example: 'Ferretería El Tornillo' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'ferreterías' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ example: 'contacto@ferreteria.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+54 2657 000000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '+54 2657 000000' })
  @IsString()
  @IsOptional()
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'https://ferreteria.com' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  facebook?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  linkedin?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Villa Mercedes' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'San Luis' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ example: 'Argentina' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    enum: ['new', 'contacted', 'qualified', 'disqualified', 'converted'],
    default: 'new',
  })
  @IsIn(['new', 'contacted', 'qualified', 'disqualified', 'converted'])
  @IsOptional()
  status?: 'new' | 'contacted' | 'qualified' | 'disqualified' | 'converted';

  @ApiPropertyOptional({
    enum: ['google_maps', 'manual', 'import'],
    default: 'manual',
  })
  @IsIn(['google_maps', 'manual', 'import'])
  @IsOptional()
  source?: 'google_maps' | 'manual' | 'import';

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  score?: number;
}
