import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type MarketingPostDocument = HydratedDocument<MarketingPost>;

export class PostMetrics {
  impressions?: number;
  views?: number;
  reach?: number;
  likes?: number;
  reactions?: number;
  comments?: number;
  shares?: number;
  reposts?: number;
  saves?: number;
  clicks?: number;
  profileVisits?: number;
  newFollowers?: number;
  avgWatchTimeSeconds?: number;
  recordedAt?: Date;
}

@Schema({ collection: 'marketing_posts', timestamps: true })
export class MarketingPost extends BaseSchema {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  copyText: string;

  @Prop({ required: true })
  network: 'linkedin' | 'instagram' | 'tiktok';

  @Prop({ required: true })
  format:
    | 'carousel'
    | 'reel'
    | 'article'
    | 'image'
    | 'video'
    | 'text'
    | 'story'
    | 'poll'
    | 'event';

  @Prop({ type: Date, default: null })
  scheduledDate: Date | null;

  @Prop({ default: 'idea' })
  status: 'idea' | 'borrador' | 'listo' | 'publicado';

  @Prop({ type: String, default: null })
  ideaId: string | null;

  @Prop({ type: String, default: null })
  attachmentUrl: string | null;

  @Prop({ trim: true })
  analysisNotes: string;

  @Prop({
    type: {
      impressions: Number,
      views: Number,
      reach: Number,
      likes: Number,
      reactions: Number,
      comments: Number,
      shares: Number,
      reposts: Number,
      saves: Number,
      clicks: Number,
      profileVisits: Number,
      newFollowers: Number,
      avgWatchTimeSeconds: Number,
      recordedAt: Date,
    },
    default: null,
  })
  metrics: PostMetrics | null;

  @Prop({ required: true })
  userId: string;
}

export const MarketingPostSchema = SchemaFactory.createForClass(MarketingPost);

MarketingPostSchema.index({ workspaceId: 1 });
MarketingPostSchema.index({ workspaceId: 1, status: 1 });
MarketingPostSchema.index({ workspaceId: 1, network: 1 });
MarketingPostSchema.index({ workspaceId: 1, scheduledDate: 1 });
MarketingPostSchema.index({ workspaceId: 1, network: 1, status: 1 });
MarketingPostSchema.index({ workspaceId: 1, createdAt: -1 });
MarketingPostSchema.index({ workspaceId: 1, ideaId: 1 });
