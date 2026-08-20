import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectRepoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  owner: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  repo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  defaultBranch: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  htmlUrl: string;
}
