import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiIndexService } from './ai-index.service';
import { AiContextService } from './ai-context.service';
import { OllamaService } from './ollama.service';
import { AiConversation, AiConversationSchema } from './ai-conversation.schema';
import { AiMessage, AiMessageSchema } from './ai-message.schema';
import { AiSettings, AiSettingsSchema } from './ai-settings.schema';
import { AiEmbedding, AiEmbeddingSchema } from './ai-embedding.schema';
import { Project, ProjectSchema } from '../projects/projects.schema';
import { Task, TaskSchema } from '../tasks/tasks.schema';
import { Invoice, InvoiceSchema } from '../invoices/invoices.schema';
import { Client, ClientSchema } from '../clients/clients.schema';
import { Note, NoteSchema } from '../notes/note.schema';
import { Document, DocumentSchema } from '../docs/docs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiConversation.name, schema: AiConversationSchema },
      { name: AiMessage.name, schema: AiMessageSchema },
      { name: AiSettings.name, schema: AiSettingsSchema },
      { name: AiEmbedding.name, schema: AiEmbeddingSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Note.name, schema: NoteSchema },
      { name: Document.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService, AiContextService, AiIndexService, OllamaService],
  exports: [AiService, AiIndexService],
})
export class AiModule {}
