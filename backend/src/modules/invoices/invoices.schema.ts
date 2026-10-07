import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type InvoiceDocument = HydratedDocument<Invoice>;

@Schema({ collection: 'invoices', timestamps: true })
export class Invoice extends BaseSchema {
  @Prop({ default: 'income' })
  type: 'income' | 'expense';

  @Prop({ required: false, trim: true })
  number: string;

  @Prop({ required: false })
  clientId: string;

  @Prop()
  projectId: string;

  @Prop({ default: 'paid' })
  status:
    | 'draft'
    | 'pending'
    | 'sent'
    | 'paid'
    | 'collected'
    | 'overdue'
    | 'cancelled';

  @Prop({ type: Date, required: true, default: Date.now })
  issueDate: Date;

  @Prop({ type: Date, required: false })
  dueDate: Date;

  @Prop({
    type: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true },
        amount: { type: Number, required: true },
      },
    ],
    default: [],
  })
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];

  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  taxRate: number;

  @Prop({ default: 0 })
  taxAmount: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: 'USD', trim: true, uppercase: true })
  currency: string;

  @Prop({ trim: true })
  notes: string;

  @Prop({ type: Date, required: false, default: null })
  paidDate?: Date | null;

  @Prop({ trim: true, required: false })
  paymentMethod?: string;

  @Prop({ type: Number, required: false, default: null })
  installmentNumber?: number | null;

  @Prop({ type: Number, required: false, default: null })
  installmentCount?: number | null;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ workspaceId: 1, status: 1 });
InvoiceSchema.index({ workspaceId: 1, clientId: 1 });
InvoiceSchema.index({ workspaceId: 1, dueDate: 1 });
InvoiceSchema.index({ workspaceId: 1, createdAt: -1 });
// Invoice numbers are unique per project (e.g. "Cuota 1" may exist in many
// projects). Standalone invoices without project keep workspace-level
// uniqueness through the second index.
InvoiceSchema.index(
  { workspaceId: 1, projectId: 1, number: 1 },
  { unique: true, partialFilterExpression: { projectId: { $ne: null } } },
);
InvoiceSchema.index(
  { workspaceId: 1, number: 1 },
  {
    unique: true,
    partialFilterExpression: {
      $or: [{ projectId: null }, { projectId: { $exists: false } }],
    },
  },
);
InvoiceSchema.index({ workspaceId: 1, projectId: 1 });
