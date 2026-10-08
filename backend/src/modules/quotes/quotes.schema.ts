import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type QuoteDocument = HydratedDocument<Quote>;

export type QuoteLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  unit?: string;
};

export type QuoteSection = {
  title: string;
  description?: string;
  items: QuoteLineItem[];
};

@Schema({ collection: 'quotes', timestamps: true })
export class Quote extends BaseSchema {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: false, trim: true })
  number: string;

  @Prop({ required: false })
  clientId: string;

  @Prop({ required: false })
  projectId: string;

  @Prop({ required: false, type: [String], default: [] })
  taskIds: string[];

  @Prop({ default: 'draft' })
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

  @Prop({ type: Date, required: true, default: Date.now })
  issueDate: Date;

  @Prop({ type: Date, required: false })
  expiresAt: Date;

  @Prop({ trim: true })
  clientName: string;

  @Prop({ trim: true })
  clientEmail: string;

  @Prop({ trim: true })
  clientAddress: string;

  @Prop({ trim: true })
  freelancerName: string;

  @Prop({ trim: true })
  freelancerEmail: string;

  @Prop({ trim: true })
  freelancerPhone: string;

  @Prop({ trim: true })
  freelancerAddress: string;

  @Prop({ trim: true })
  freelancerWebsite: string;

  @Prop({ trim: true })
  freelancerTaxId: string;

  @Prop({ type: String, default: null })
  agencyLogoFileId: string | null;

  @Prop({
    type: [
      {
        title: { type: String },
        description: { type: String },
        items: {
          type: [
            {
              description: { type: String, required: true },
              quantity: { type: Number, required: true, default: 1 },
              unitPrice: { type: Number, required: true },
              amount: { type: Number, required: true },
              unit: { type: String },
            },
          ],
          default: [],
        },
      },
    ],
    default: [],
  })
  sections: QuoteSection[];

  @Prop({
    type: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true },
        amount: { type: Number, required: true },
        unit: { type: String },
      },
    ],
    default: [],
  })
  items: QuoteLineItem[];

  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  taxRate: number;

  @Prop({ default: 0 })
  taxAmount: number;

  @Prop({ default: 0 })
  discountPercent: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: 'USD', trim: true, uppercase: true })
  currency: string;

  @Prop({ trim: true })
  notes: string;

  @Prop({ trim: true })
  paymentTerms: string;

  @Prop({ trim: true })
  validityNote: string;

  @Prop({ trim: true })
  scope: string;

  @Prop({ trim: true })
  deliverables: string;

  @Prop({ type: String, default: null })
  pdfUrl: string | null;

  @Prop({ default: false })
  isDemo: boolean;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);

QuoteSchema.index({ workspaceId: 1 });
QuoteSchema.index({ workspaceId: 1, status: 1 });
QuoteSchema.index({ workspaceId: 1, createdAt: -1 });
QuoteSchema.index({ workspaceId: 1, clientId: 1 });
QuoteSchema.index({ workspaceId: 1, projectId: 1 });
QuoteSchema.index({ workspaceId: 1, issueDate: -1 });
QuoteSchema.index({ workspaceId: 1, isDemo: 1 });
