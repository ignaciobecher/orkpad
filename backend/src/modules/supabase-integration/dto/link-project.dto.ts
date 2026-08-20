import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LinkSupabaseProjectDto {
  @ApiProperty({
    description: 'Supabase project reference ID (e.g. abcdefghijklmnop)',
  })
  @IsString()
  supabaseProjectRef: string;
}
