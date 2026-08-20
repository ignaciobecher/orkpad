import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConnectSupabaseDto {
  @ApiProperty({
    description: 'Supabase Personal Access Token (Management API)',
  })
  @IsString()
  personalAccessToken: string;

  @ApiProperty({
    description:
      'Supabase service role key starting with sb_secret_ (Metrics API)',
  })
  @IsString()
  serviceRoleKey: string;
}
