import { Prop } from '@nestjs/mongoose';

export abstract class BaseSchema {
  @Prop({ required: true, index: true })
  workspaceId: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
