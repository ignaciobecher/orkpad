import { ApiProperty } from '@nestjs/swagger';
import { WorkloadConstellationTaskDto } from './workload-constellation-task.dto';

export class WorkloadConstellationNodeDto {
  @ApiProperty()
  projectId: string;

  @ApiProperty()
  projectName: string;

  @ApiProperty({ nullable: true })
  clientId: string | null;

  @ApiProperty({ nullable: true })
  clientName: string | null;

  @ApiProperty({ enum: ['active', 'on-hold', 'completed', 'archived'] })
  status: string;

  @ApiProperty({
    nullable: true,
    description:
      'Nearest upcoming task due date, falling back to the project end date',
  })
  dueDate: string | null;

  @ApiProperty({
    nullable: true,
    description:
      'Days until dueDate; negative if overdue; null if no dueDate is known',
  })
  daysUntilDue: number | null;

  @ApiProperty({
    description:
      'Last known activity: latest time entry, falling back to latest task update, falling back to project update',
  })
  lastActivityAt: string;

  @ApiProperty({ description: 'Days since lastActivityAt' })
  daysSinceActivity: number;

  @ApiProperty({
    enum: ['time-entry', 'task-update', 'project-update'],
    description:
      'Which signal determined lastActivityAt: a logged time entry, a task edit, or (only when the project has no tasks/time entries at all) the project document itself',
  })
  activitySource: 'time-entry' | 'task-update' | 'project-update';

  @ApiProperty({
    type: [WorkloadConstellationTaskDto],
    description:
      'Pending tasks to render orbiting the project, nearest due date first, capped for scene legibility',
  })
  tasks: WorkloadConstellationTaskDto[];
}
