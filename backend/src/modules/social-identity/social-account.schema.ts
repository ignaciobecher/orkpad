import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type SocialAccountDocument = HydratedDocument<SocialAccount>;

export class SocialAccountIdentity {
  bio: string;
  profilePhoto: string;
  bannerDescription: string;
  linkInBio: string;
  positioning: string;
  uniqueAngle: string;
}

export class SocialAccountAudience {
  primaryProfile: string;
  ageRange: string;
  painPoints: string[];
  desires: string[];
  whereLive: string[];
  notFor: string[];
}

export class SocialAccountContentPillar {
  name: string;
  description?: string;
  frequency?: string;
  examples?: string[];
  callToAction?: string;
}

export class SocialAccountStyleRules {
  doList: string[];
  dontList: string[];
  toneWords: string[];
  format: string;
  videoStyle: string;
  postLength: string;
}

export class SocialAccountMessageTemplate {
  name: string;
  type: string;
  subject?: string;
  body: string;
  variables?: string[];
  useCase?: string;
  followUpDays?: number;
}

export class SocialAccountProspecting {
  weeklyGoal: number;
  targetIndustries: string[];
  targetRoles: string[];
  targetCities: string[];
  qualificationCriteria: string[];
  disqualificationCriteria: string[];
  searchStrategy: string;
  conversionGoal: string;
}

export class SocialAccountWeeklyMetric {
  weekNumber: number;
  year: number;
  postsPublished: number;
  connectionsRequested?: number;
  messagesSent: number;
  responsesReceived: number;
  callsBooked: number;
  clientsClosed: number;
  topPerformingPost?: string;
  notes?: string;
  recordedAt: Date;
}

@Schema({ collection: 'social-accounts', timestamps: true })
export class SocialAccount extends BaseSchema {
  @Prop({ required: true, trim: true })
  accountName: string;

  @Prop({
    required: true,
    enum: ['tiktok', 'linkedin', 'instagram', 'twitter', 'youtube', 'email'],
  })
  platform:
    | 'tiktok'
    | 'linkedin'
    | 'instagram'
    | 'twitter'
    | 'youtube'
    | 'email';

  @Prop({ required: true, trim: true })
  handle: string;

  @Prop({
    required: true,
    enum: ['clients', 'founders', 'devs', 'saas', 'mixed'],
  })
  purpose: 'clients' | 'founders' | 'devs' | 'saas' | 'mixed';

  @Prop({ trim: true })
  purposeDescription: string;

  @Prop({
    type: {
      bio: String,
      profilePhoto: String,
      bannerDescription: String,
      linkInBio: String,
      positioning: String,
      uniqueAngle: String,
    },
    default: null,
  })
  identity: SocialAccountIdentity | null;

  @Prop({
    type: {
      primaryProfile: String,
      ageRange: String,
      painPoints: [String],
      desires: [String],
      whereLive: [String],
      notFor: [String],
    },
    default: null,
  })
  audience: SocialAccountAudience | null;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        description: String,
        frequency: String,
        examples: [String],
        callToAction: String,
      },
    ],
    default: [],
  })
  contentPillars: SocialAccountContentPillar[];

  @Prop({
    type: {
      doList: [String],
      dontList: [String],
      toneWords: [String],
      format: String,
      videoStyle: String,
      postLength: String,
    },
    default: null,
  })
  styleRules: SocialAccountStyleRules | null;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        subject: String,
        body: { type: String, required: true },
        variables: [String],
        useCase: String,
        followUpDays: Number,
      },
    ],
    default: [],
  })
  messageTemplates: SocialAccountMessageTemplate[];

  @Prop({
    type: {
      weeklyGoal: Number,
      targetIndustries: [String],
      targetRoles: [String],
      targetCities: [String],
      qualificationCriteria: [String],
      disqualificationCriteria: [String],
      searchStrategy: String,
      conversionGoal: String,
    },
    default: null,
  })
  prospecting: SocialAccountProspecting | null;

  @Prop({
    type: [
      {
        weekNumber: { type: Number, required: true },
        year: { type: Number, required: true },
        postsPublished: { type: Number, required: true, default: 0 },
        connectionsRequested: Number,
        messagesSent: { type: Number, required: true, default: 0 },
        responsesReceived: { type: Number, required: true, default: 0 },
        callsBooked: { type: Number, required: true, default: 0 },
        clientsClosed: { type: Number, required: true, default: 0 },
        topPerformingPost: String,
        notes: String,
        recordedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  weeklyMetrics: SocialAccountWeeklyMetric[];

  @Prop({ default: 'active', enum: ['active', 'paused', 'archived'] })
  status: 'active' | 'paused' | 'archived';

  @Prop({ default: 0 })
  followersCount: number;

  @Prop({ trim: true })
  color: string;

  @Prop({ trim: true })
  emoji: string;
}

export const SocialAccountSchema = SchemaFactory.createForClass(SocialAccount);

SocialAccountSchema.index({ workspaceId: 1 });
SocialAccountSchema.index({ workspaceId: 1, status: 1 });
SocialAccountSchema.index({ workspaceId: 1, platform: 1 });
SocialAccountSchema.index({ workspaceId: 1, createdAt: -1 });
