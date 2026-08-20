import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedResult } from '../../common/base/base.repository';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .select('+password +refreshToken')
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findWorkspaceMemberById(
    workspaceId: string,
    id: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: id, workspaceId }).exec();
  }

  async findAllByWorkspace(
    workspaceId: string,
    options: { search?: string; page?: number; limit?: number } = {},
  ): Promise<PaginatedResult<UserDocument>> {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const filters: Record<string, any> = { workspaceId };

    if (options.search) {
      filters.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { email: { $regex: options.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filters)
        .sort({ name: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filters),
    ]);

    return { data, total, page, limit };
  }

  async findByGithubId(githubId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ githubId }).exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findByIdWithGoogleTokens(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(id)
      .select('+googleAccessToken +googleRefreshToken')
      .exec();
  }

  async findByIdWithSecrets(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+refreshToken').exec();
  }

  async findByVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ emailVerificationToken: token })
      .select('+emailVerificationToken')
      .exec();
  }

  async findByPasswordResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ passwordResetToken: token })
      .select('+passwordResetToken')
      .exec();
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async update(id: string, data: Partial<User>): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' })
      .exec();
  }

  async findByIdWithTwoFactor(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+twoFactorSecret').exec();
  }

  async findByIdWithGithubToken(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+githubAccessToken').exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }

  async findByIdWithWebAuthn(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+webauthnCredentials').exec();
  }

  async findByCredentialId(credentialId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ 'webauthnCredentials.credentialId': credentialId })
      .select('+webauthnCredentials')
      .exec();
  }

  async addWebAuthnCredential(
    userId: string,
    credential: {
      credentialId: string;
      publicKey: string;
      counter: number;
      transports: string[];
      deviceName: string;
    },
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $push: {
          webauthnCredentials: { ...credential, registeredAt: new Date() },
        },
      })
      .exec();
  }

  async updateWebAuthnCounter(
    userId: string,
    credentialId: string,
    counter: number,
  ): Promise<void> {
    await this.userModel
      .findOneAndUpdate(
        { _id: userId, 'webauthnCredentials.credentialId': credentialId },
        { $set: { 'webauthnCredentials.$.counter': counter } },
      )
      .exec();
  }

  async removeWebAuthnCredential(
    userId: string,
    credentialId: string,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $pull: { webauthnCredentials: { credentialId } },
      })
      .exec();
  }

  async findAll(
    options: { search?: string; page?: number; limit?: number } = {},
  ): Promise<PaginatedResult<UserDocument>> {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const filters: Record<string, any> = {};

    if (options.search) {
      filters.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { email: { $regex: options.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filters),
    ]);

    return { data, total, page, limit };
  }
}
