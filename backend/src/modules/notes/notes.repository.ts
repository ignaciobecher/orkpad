import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Note, NoteDocument } from './note.schema';

@Injectable()
export class NotesRepository extends BaseRepository<NoteDocument> {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
  ) {
    super(noteModel);
  }

  async updateOrder(
    workspaceId: string,
    items: { id: string; order: number }[],
  ): Promise<void> {
    await Promise.all(
      items.map(({ id, order }) =>
        this.noteModel.updateOne(
          { _id: id, workspaceId, isDeleted: false },
          { $set: { order } },
        ),
      ),
    );
  }
}
