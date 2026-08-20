import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';

export class ReorderTestimonialItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderTestimonialsDto {
  @ApiProperty({ type: [ReorderTestimonialItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderTestimonialItemDto)
  items: ReorderTestimonialItemDto[];
}
