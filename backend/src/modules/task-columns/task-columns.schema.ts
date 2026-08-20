import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type TaskColumnDocument = HydratedDocument<TaskColumn>;

@Schema({ collection: 'task-columns', timestamps: true })
export class TaskColumn extends BaseSchema {
  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '#5B4EFF' })
  color: string;

  @Prop({ default: 0 })
  order: number;
}

export const TaskColumnSchema = SchemaFactory.createForClass(TaskColumn);

TaskColumnSchema.index({ workspaceId: 1, projectId: 1 });
TaskColumnSchema.index({ workspaceId: 1, projectId: 1, order: 1 });
