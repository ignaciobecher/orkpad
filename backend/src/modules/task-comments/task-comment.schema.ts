import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type TaskCommentDocument = HydratedDocument<TaskComment>;

@Schema({ collection: 'task-comments', timestamps: true })
export class TaskComment extends BaseSchema {
  @Prop({ required: true })
  taskId: string;

  @Prop()
  projectId: string;

  @Prop({ required: true })
  authorId: string;

  @Prop()
  authorName: string;

  @Prop({ required: true, trim: true, maxlength: 5000 })
  text: string;

  @Prop({ type: [String], default: [] })
  mentions: string[];

  @Prop({ type: Date, default: null })
  editedAt: Date | null;
}

export const TaskCommentSchema = SchemaFactory.createForClass(TaskComment);

TaskCommentSchema.index({ workspaceId: 1, taskId: 1, createdAt: 1 });
TaskCommentSchema.index({ workspaceId: 1, projectId: 1 });
