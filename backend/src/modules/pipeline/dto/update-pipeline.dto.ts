import { PartialType } from '@nestjs/swagger';
import { CreateDealDto } from './create-pipeline.dto';

export class UpdateDealDto extends PartialType(CreateDealDto) {}
