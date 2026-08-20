import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  ProjectLinkCredential,
  ProjectLinkCredentialDocument,
} from './project-link-credential.schema';

@Injectable()
export class ProjectLinkCredentialRepository extends BaseRepository<ProjectLinkCredentialDocument> {
  constructor(
    @InjectModel(ProjectLinkCredential.name)
    private readonly credentialModel: Model<ProjectLinkCredentialDocument>,
  ) {
    super(credentialModel);
  }

  findByProjectId(
    workspaceId: string,
    projectId: string,
  ): Promise<ProjectLinkCredentialDocument | null> {
    return this.credentialModel
      .findOne({ workspaceId, projectId, isDeleted: false })
      .exec();
  }

  findByProjectIdWithHash(
    workspaceId: string,
    projectId: string,
  ): Promise<ProjectLinkCredentialDocument | null> {
    return this.credentialModel
      .findOne({ workspaceId, projectId, isDeleted: false })
      .select('+passwordHash')
      .exec();
  }

  softDeleteByProjectId(
    workspaceId: string,
    projectId: string,
  ): Promise<ProjectLinkCredentialDocument | null> {
    return this.credentialModel
      .findOneAndUpdate(
        { workspaceId, projectId, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { returnDocument: 'after' },
      )
      .exec();
  }
}
