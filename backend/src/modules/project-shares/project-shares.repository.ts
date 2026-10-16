import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { ProjectShare, ProjectShareDocument } from './project-share.schema';

@Injectable()
export class ProjectSharesRepository extends BaseRepository<ProjectShareDocument> {
  constructor(
    @InjectModel(ProjectShare.name)
    private readonly shareModel: Model<ProjectShareDocument>,
  ) {
    super(shareModel);
  }

  findByProject(workspaceId: string, projectId: string) {
    return this.shareModel
      .find({ workspaceId, projectId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  /** Búsqueda global por username (el login del portal no tiene workspace). */
  findByUsername(username: string) {
    return this.shareModel
      .findOne({ username: username.toLowerCase(), isDeleted: false })
      .select('+passwordHash')
      .exec();
  }

  findByToken(token: string) {
    return this.shareModel.findOne({ token, isDeleted: false }).exec();
  }

  touchAccess(workspaceId: string, id: string) {
    return this.shareModel
      .updateOne(
        { _id: id, workspaceId },
        { $set: { lastAccessAt: new Date() } },
      )
      .exec()
      .catch(() => null);
  }
}
