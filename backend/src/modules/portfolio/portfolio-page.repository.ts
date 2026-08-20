import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';
import {
  PortfolioPage,
  PortfolioPageDocument,
} from './schemas/portfolio-page.schema';

@Injectable()
export class PortfolioPageRepository {
  constructor(
    @InjectModel(PortfolioPage.name)
    private readonly model: Model<PortfolioPageDocument>,
  ) {}

  async findByWorkspace(
    workspaceId: string,
  ): Promise<PortfolioPageDocument | null> {
    return this.model.findOne({ workspaceId, isDeleted: false }).exec();
  }

  async upsert(
    workspaceId: string,
    data: Record<string, any>,
  ): Promise<PortfolioPageDocument> {
    const doc = await this.model
      .findOneAndUpdate(
        { workspaceId },
        { $set: { ...data, workspaceId } },
        { upsert: true, new: true },
      )
      .exec();
    return doc;
  }

  async duplicateSection(
    workspaceId: string,
    sectionId: string,
  ): Promise<PortfolioPageDocument | null> {
    const page = await this.findByWorkspace(workspaceId);
    if (!page) return null;

    const original = page.sections.find((s: any) => s.id === sectionId);
    if (!original) return null;

    const originalPlain = (original as any).toObject
      ? (original as any).toObject()
      : { ...original };

    const shifted = page.sections.map((s: any) => {
      const plain = s.toObject ? s.toObject() : { ...s };
      return plain.order > originalPlain.order
        ? { ...plain, order: plain.order + 1 }
        : plain;
    });

    const clone = {
      ...originalPlain,
      id: randomUUID(),
      order: originalPlain.order + 1,
    };
    const newSections = [...shifted, clone].sort((a, b) => a.order - b.order);

    return this.model
      .findOneAndUpdate(
        { workspaceId },
        { $set: { sections: newSections } },
        { new: true },
      )
      .exec();
  }
}
