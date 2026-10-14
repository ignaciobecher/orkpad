import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type TaskActivityDocument = HydratedDocument<TaskActivity>;

export type TaskActivityType =
  | 'created'
  | 'updated'
  | 'moved'
  | 'completed'
  | 'reopened'
  | 'commented'
  | 'attachment_added'
  | 'attachment_removed'
  | 'member_added'
  | 'member_removed'
  | 'archived'
  | 'unarchived'
  | 'duplicated';

@Schema({ collection: 'task-activities', timestamps: true })
export class TaskActivity extends BaseSchema {
  @Prop({ required: true })
  taskId: string;

  @Prop()
  projectId: string;

  @Prop()
  actorId: string;

  @Prop()
  actorName: string;

  @Prop({ required: true })
  type: TaskActivityType;

  @Prop({ type: Object, default: {} })
  payload: Record<string, any>;
}

export const TaskActivitySchema =
  SchemaFactory.createForClass(TaskActivity);

TaskActivitySchema.index({ workspaceId: 1, taskId: 1, createdAt: -1 });
TaskActivitySchema.index({ workspaceId: 1, projectId: 1, createdAt: -1 });
