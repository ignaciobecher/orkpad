import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkSessionsController } from './work-sessions.controller';
import { WorkSessionsService } from './work-sessions.service';
import { WorkSessionsRepository } from './work-sessions.repository';
import { WorkSession, WorkSessionSchema } from './work-sessions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkSession.name, schema: WorkSessionSchema },
    ]),
  ],
  controllers: [WorkSessionsController],
  providers: [WorkSessionsService, WorkSessionsRepository],
  exports: [WorkSessionsService],
})
export class WorkSessionsModule {}
