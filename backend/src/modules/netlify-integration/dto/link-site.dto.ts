import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LinkSiteDto {
  @ApiProperty({
    description: 'Netlify site ID to link',
    example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  netlifySiteId: string;
}
