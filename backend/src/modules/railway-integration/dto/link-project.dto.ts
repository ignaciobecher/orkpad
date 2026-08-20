import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LinkProjectDto {
  @ApiProperty({
    description: 'Railway project ID to link',
    example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  railwayProjectId: string;
}
