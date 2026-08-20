import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workspace, WorkspaceDocument } from './workspaces.schema';

@Injectable()
export class WorkspacesRepository {
  constructor(
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async findById(id: string): Promise<WorkspaceDocument | null> {
    return this.workspaceModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  async findBySlug(slug: string): Promise<WorkspaceDocument | null> {
    return this.workspaceModel.findOne({ slug, isDeleted: false }).exec();
  }

  async create(data: Partial<Workspace>): Promise<WorkspaceDocument> {
    const workspace = new this.workspaceModel(data);
    return workspace.save();
  }

  async update(
    id: string,
    data: Partial<Workspace>,
  ): Promise<WorkspaceDocument | null> {
    return this.workspaceModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: data },
        { returnDocument: 'after' },
      )
      .exec();
  }
}
