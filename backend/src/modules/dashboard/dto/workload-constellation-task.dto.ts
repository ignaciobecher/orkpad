import { ApiProperty } from '@nestjs/swagger';

export class WorkloadConstellationTaskDto {
  @ApiProperty()
  taskId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  dueDate: string | null;

  @ApiProperty({
    nullable: true,
    description:
      'Days until dueDate; negative if overdue; null if no dueDate is set',
  })
  daysUntilDue: number | null;

  @ApiProperty({ enum: ['todo', 'in-progress'] })
  status: string;
}
