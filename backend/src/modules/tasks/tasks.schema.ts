import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ collection: 'tasks', timestamps: true })
export class Task extends BaseSchema {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop()
  projectId: string;

  @Prop()
  assigneeId: string;

  @Prop({ default: 'todo' })
  status: 'todo' | 'in-progress' | 'done' | 'cancelled';

  @Prop({ default: 'medium' })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Prop({ type: Date })
  dueDate: Date;

  @Prop({ type: String, default: null })
  columnId: string | null;

  @Prop({ default: 0 })
  order: number;

  @Prop({
    type: [{ text: String, completed: { type: Boolean, default: false } }],
    default: [],
  })
  checklist: { text: string; completed: boolean }[];

  @Prop({ type: [Object], default: [] })
  labels: { id: string; name: string; color: string }[];

  @Prop({ type: [Object], default: [] })
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
  }[];

  @Prop({ default: false })
  isDemo: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ workspaceId: 1, status: 1 });
TaskSchema.index({ workspaceId: 1, projectId: 1 });
TaskSchema.index({ workspaceId: 1, assigneeId: 1 });
TaskSchema.index({ workspaceId: 1, priority: 1 });
TaskSchema.index({ workspaceId: 1, dueDate: 1 });
TaskSchema.index({ workspaceId: 1, columnId: 1, order: 1 });
TaskSchema.index({ workspaceId: 1, createdAt: -1 });
TaskSchema.index({ workspaceId: 1, isDemo: 1 });
