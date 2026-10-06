import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

// Users are global entities — not workspace-scoped. They are the only exception to BaseSchema.
@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, required: false, default: null, select: false })
  password?: string | null;

  @Prop({ type: String, default: null })
  githubId?: string | null;

  @Prop({ type: String, default: null, select: false })
  githubAccessToken?: string | null;

  @Prop({ type: String, default: null })
  avatarUrl?: string | null;

  @Prop({ type: String, default: null, select: false })
  refreshToken: string | null;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ default: false })
  termsAccepted: boolean;

  @Prop({ type: Date, default: null })
  termsAcceptedAt: Date;

  @Prop({ default: '1.0.0' })
  termsVersion: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ type: String, default: null, select: false })
  emailVerificationToken?: string | null;

  @Prop({ type: Date, default: null })
  emailVerificationTokenExpiresAt?: Date | null;

  @Prop({ type: String, default: null, select: false })
  passwordResetToken?: string | null;

  @Prop({ type: Date, default: null })
  passwordResetTokenExpiresAt?: Date | null;

  @Prop({ type: String, default: null })
  phone?: string | null;

  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop({ type: String, default: null, select: false })
  twoFactorSecret?: string | null;

  @Prop({
    type: {
      publicTaskCreated: { type: Boolean, default: true },
    },
    default: () => ({ publicTaskCreated: true }),
  })
  notificationPreferences: {
    publicTaskCreated: boolean;
  };

  @Prop({ type: Date, default: null })
  lastLogin?: Date | null;

  @Prop({ default: false })
  onboardingCompleted: boolean;

  @Prop({
    type: {
      addedFirstClient: { type: Boolean, default: false },
      addedFirstProject: { type: Boolean, default: false },
      addedThreeTasks: { type: Boolean, default: false },
      loggedFirstHours: { type: Boolean, default: false },
    },
    default: () => ({}),
  })
  onboardingSteps: {
    addedFirstClient: boolean;
    addedFirstProject: boolean;
    addedThreeTasks: boolean;
    loggedFirstHours: boolean;
  };

  @Prop({
    type: [
      {
        credentialId: { type: String, required: true },
        publicKey: { type: String, required: true },
        counter: { type: Number, required: true, default: 0 },
        transports: { type: [String], default: [] },
        deviceName: { type: String, default: 'Dispositivo' },
        registeredAt: { type: Date, default: () => new Date() },
      },
    ],
    default: [],
    select: false,
  })
  webauthnCredentials: Array<{
    credentialId: string;
    publicKey: string;
    counter: number;
    transports: string[];
    deviceName: string;
    registeredAt: Date;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
