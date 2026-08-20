import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PortfolioPageDocument = HydratedDocument<PortfolioPage>;

@Schema({ _id: false })
class PortfolioTheme {
  @Prop({ default: '#2563EB' })
  primaryColor: string;

  @Prop({ default: 'dark' })
  colorScheme: string;

  @Prop({ default: 'inter' })
  fontFamily: string;
}

@Schema({ _id: false })
class PortfolioSeo {
  @Prop({ trim: true })
  title?: string;

  @Prop({ trim: true, maxlength: 300 })
  description?: string;

  @Prop()
  ogImageUrl?: string;
}

@Schema({ _id: false })
class PortfolioSection {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  type: string;

  @Prop({ default: true })
  visible: boolean;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: Object, default: {} })
  content: Record<string, any>;

  @Prop({ type: Object, default: {} })
  settings: Record<string, any>;
}

@Schema({ collection: 'portfolio_pages', timestamps: true })
export class PortfolioPage {
  @Prop({ required: true, unique: true, index: true })
  workspaceId: string;

  @Prop({ type: PortfolioTheme, default: {} })
  theme: PortfolioTheme;

  @Prop({ type: PortfolioSeo, default: {} })
  seo: PortfolioSeo;

  @Prop({ type: [PortfolioSection], default: [] })
  sections: PortfolioSection[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const PortfolioPageSchema = SchemaFactory.createForClass(PortfolioPage);
