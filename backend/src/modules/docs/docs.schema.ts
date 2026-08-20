import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type DocumentDocument = HydratedDocument<Document>;

@Schema({ collection: 'documents', timestamps: true })
export class Document extends BaseSchema {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  content: string;

  @Prop()
  folderId: string;

  @Prop()
  projectId: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const DocumentSchema = SchemaFactory.createForClass(Document);

DocumentSchema.index({ workspaceId: 1 });
DocumentSchema.index({ workspaceId: 1, folderId: 1 });
DocumentSchema.index({ workspaceId: 1, projectId: 1 });
DocumentSchema.index({ workspaceId: 1, createdAt: -1 });
