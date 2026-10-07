import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CopyTaskColumnsDto {
  @ApiProperty({
    example: '64b1f2c3d4e5f6a7b8c9d0e1',
    description: 'Proyecto origen del cual copiar las columnas',
  })
  @IsString()
  sourceProjectId: string;

  @ApiProperty({
    example: '64b1f2c3d4e5f6a7b8c9d0e2',
    description: 'Proyecto destino que recibe las columnas (debe estar vacío)',
  })
  @IsString()
  targetProjectId: string;
}
