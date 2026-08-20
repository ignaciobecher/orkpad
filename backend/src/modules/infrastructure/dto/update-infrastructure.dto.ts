import { PartialType } from '@nestjs/swagger';
import { CreateInfrastructureResourceDto } from './create-infrastructure.dto';

export class UpdateInfrastructureResourceDto extends PartialType(
  CreateInfrastructureResourceDto,
) {}
