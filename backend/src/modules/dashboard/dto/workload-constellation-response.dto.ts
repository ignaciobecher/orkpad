import { ApiProperty } from '@nestjs/swagger';
import { WorkloadConstellationNodeDto } from './workload-constellation-node.dto';

export class WorkloadConstellationResponseDto {
  @ApiProperty()
  generatedAt: string;

  @ApiProperty({ type: [WorkloadConstellationNodeDto] })
  nodes: WorkloadConstellationNodeDto[];
}
