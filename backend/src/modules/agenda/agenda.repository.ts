import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Event, EventDocument } from './agenda.schema';

@Injectable()
export class EventsRepository extends BaseRepository<EventDocument> {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
  ) {
    super(eventModel);
  }
}
