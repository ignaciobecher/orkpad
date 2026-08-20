import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type NoteDocument = HydratedDocument<Note>;

export type NoteType = 'note' | 'checklist';
export type NoteStatus = 'active' | 'done';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

@Schema({ collection: 'notes', timestamps: true })
export class Note extends BaseSchema {
  @Prop({ type: String, trim: true, maxlength: 120, default: null })
  title: string | null;

  @Prop({ type: String, trim: true, maxlength: 10000, default: '' })
  content: string;

  @Prop({ type: String, default: 'note' })
  type: NoteType;

  @Prop({ type: String, default: 'active' })
  status: NoteStatus;

  @Prop({ type: Boolean, default: false })
  isPinned: boolean;

  @Prop({ type: String, default: null })
  color: string | null;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, default: null })
  projectId: string | null;

  @Prop({ type: String, default: null })
  clientId: string | null;

  @Prop({
    type: [
      {
        id: String,
        text: String,
        completed: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  checklist: ChecklistItem[];

  @Prop({ default: 0 })
  order: number;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

NoteSchema.index({ workspaceId: 1 });
NoteSchema.index({ workspaceId: 1, status: 1 });
NoteSchema.index({ workspaceId: 1, isPinned: 1, order: 1 });
NoteSchema.index({ workspaceId: 1, createdAt: -1 });
NoteSchema.index({ workspaceId: 1, projectId: 1 });
NoteSchema.index({ workspaceId: 1, clientId: 1 });
