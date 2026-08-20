import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-agenda.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {}
