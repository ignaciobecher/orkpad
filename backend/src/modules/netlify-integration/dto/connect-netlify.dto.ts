import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectNetlifyDto {
  @ApiProperty({
    description: 'Netlify personal access token',
    example: 'nfp_xxxxxxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  apiToken: string;
}
