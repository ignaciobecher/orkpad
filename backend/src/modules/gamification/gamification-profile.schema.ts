import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type GamificationProfileDocument = HydratedDocument<GamificationProfile>;

export class GamificationStats {
  @Prop({ default: 0 })
  goalsCompleted: number;

  @Prop({ default: 0 })
  learningEntriesLogged: number;

  @Prop({ default: 0 })
  resourcesCompleted: number;

  @Prop({ default: 0 })
  skillFociCompleted: number;

  @Prop({ default: 0 })
  outreachActivitiesLogged: number;
}

@Schema({ collection: 'gamification-profiles', timestamps: true })
export class GamificationProfile extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  currentStreakDays: number;

  @Prop({ default: 0 })
  bestStreakDays: number;

  @Prop({ type: Date, default: null })
  lastActivityDate: Date | null;

  @Prop({ type: [String], default: [] })
  badges: string[];

  @Prop({ type: GamificationStats, default: () => ({}) })
  stats: GamificationStats;
}

export const GamificationProfileSchema =
  SchemaFactory.createForClass(GamificationProfile);

GamificationProfileSchema.index({ workspaceId: 1 });
GamificationProfileSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true },
);
