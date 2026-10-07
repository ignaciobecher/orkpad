import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiEmbedding, AiEmbeddingDocument } from './ai-embedding.schema';
import { AiSettings, AiSettingsDocument } from './ai-settings.schema';
import { Note, NoteDocument } from '../notes/note.schema';
import { Document, DocumentDocument } from '../docs/docs.schema';
import { Task, TaskDocument } from '../tasks/tasks.schema';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { Invoice, InvoiceDocument } from '../invoices/invoices.schema';
import { OllamaService } from './ollama.service';

const CHUNK_SIZE = 1000;

export interface IndexedChunk {
  refType: string;
  refId: string;
  projectId: string | null;
  title: string;
  chunk: string;
  embedding: number[];
}

@Injectable()
export class AiIndexService {
  constructor(
    @InjectModel(AiEmbedding.name) private readonly embeddingModel: Model<AiEmbeddingDocument>,
    @InjectModel(AiSettings.name) private readonly settingsModel: Model<AiSettingsDocument>,
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
    @InjectModel(Document.name) private readonly docModel: Model<DocumentDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
    private readonly ollama: OllamaService,
  ) {}

  async settings(workspaceId: string) {
    const s = await this.settingsModel.findOne({ workspaceId }).lean().exec();
    return {
      enabled: s?.enabled ?? true,
      ollamaBaseUrl: s?.ollamaBaseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://ollama:11434',
      chatModel: s?.chatModel ?? process.env.OLLAMA_CHAT_MODEL ?? 'qwen2.5:7b',
      embedModel: s?.embedModel ?? process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
      temperature: s?.temperature ?? 0.3,
      systemPrompt: s?.systemPrompt ?? null,
      indexTypes: s?.indexTypes ?? ['note', 'doc', 'task', 'project', 'invoice'],
    };
  }

  chunkText(text: string): string[] {
    const clean = (text ?? '').replace(/\s+/g, ' ').trim();
    if (!clean) return [];
    const chunks: string[] = [];
    for (let i = 0; i < clean.length; i += CHUNK_SIZE) {
      chunks.push(clean.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  }

  cosine(a: number[], b: number[]): number {
    let dot = 0;
    let na = 0;
    let nb = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    if (!na || !nb) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  async retrieve(workspaceId: string, query: string, projectId?: string, limit = 6) {
    const cfg = await this.settings(workspaceId);
    const baseUrl = this.ollama.normalizeUrl(cfg.ollamaBaseUrl);
    const qvec = await this.ollama.embed(baseUrl, cfg.embedModel, query);
    const match: Record<string, any> = { workspaceId, isDeleted: false };
    if (projectId) match.$or = [{ projectId }, { projectId: null }];
    const docs = await this.embeddingModel.find(match).lean().exec();
    return docs
      .map((d) => ({ doc: d, score: this.cosine(qvec, d.embedding ?? []) }))
      .filter((r) => r.score > 0.25)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => ({
        refType: r.doc.refType,
        refId: r.doc.refId,
        title: r.doc.title,
        chunk: r.doc.chunk,
      }));
  }

  private stripHtml(html: string) {
    return (html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  async reindex(workspaceId: string) {
    const cfg = await this.settings(workspaceId);
    const baseUrl = this.ollama.normalizeUrl(cfg.ollamaBaseUrl);
    const types = new Set(cfg.indexTypes);
    const items: { refType: string; refId: string; projectId: string | null; title: string; text: string }[] = [];

    if (types.has('note')) {
      const notes = await this.noteModel.find({ workspaceId, isDeleted: false }, { title: 1, content: 1, projectId: 1 }).lean().exec();
      for (const n of notes) {
        items.push({ refType: 'note', refId: n._id.toString(), projectId: n.projectId ?? null, title: n.title ?? 'Nota', text: `${n.title ?? ''}\n${this.stripHtml(n.content)}` });
      }
    }
    if (types.has('doc')) {
      const docs = await this.docModel.find({ workspaceId, isDeleted: false }, { title: 1, content: 1, projectId: 1 }).lean().exec();
      for (const d of docs) {
        let text = d.content ?? '';
        try {
          const parsed = JSON.parse(text);
          text = parsed.text ?? parsed.data ?? text;
          if (typeof text !== 'string' || text.startsWith('data:')) text = d.title ?? '';
        } catch {
          // texto plano
        }
        items.push({ refType: 'doc', refId: d._id.toString(), projectId: d.projectId ?? null, title: d.title ?? 'Documento', text: `${d.title ?? ''}\n${this.stripHtml(text)}` });
      }
    }
    if (types.has('task')) {
      const tasks = await this.taskModel.find({ workspaceId, isDeleted: false }, { title: 1, description: 1, projectId: 1, status: 1 }).lean().exec();
      for (const t of tasks) {
        items.push({ refType: 'task', refId: t._id.toString(), projectId: t.projectId ?? null, title: t.title, text: `${t.title}\n${this.stripHtml(t.description ?? '')} (estado: ${t.status})` });
      }
    }
    if (types.has('project')) {
      const projects = await this.projectModel.find({ workspaceId, isDeleted: false }, { name: 1, description: 1, status: 1, budget: 1 }).lean().exec();
      for (const p of projects) {
        items.push({ refType: 'project', refId: p._id.toString(), projectId: p._id.toString(), title: p.name, text: `${p.name}\n${p.description ?? ''} (estado: ${p.status}, presupuesto: ${p.budget ?? 0})` });
      }
    }
    if (types.has('invoice')) {
      const invoices = await this.invoiceModel.find({ workspaceId, isDeleted: false }, { number: 1, status: 1, total: 1, dueDate: 1, projectId: 1 }).lean().exec();
      for (const i of invoices) {
        items.push({ refType: 'invoice', refId: i._id.toString(), projectId: i.projectId ?? null, title: `Factura ${i.number ?? ''}`, text: `Factura ${i.number ?? ''} total ${i.total ?? 0} estado ${i.status} vence ${i.dueDate ?? 's/d'}` });
      }
    }

    await this.embeddingModel.deleteMany({ workspaceId }).exec();
    let chunks = 0;
    for (const item of items) {
      for (const chunk of this.chunkText(item.text)) {
        const embedding = await this.ollama.embed(baseUrl, cfg.embedModel, chunk);
        await this.embeddingModel.create({ workspaceId, refType: item.refType, refId: item.refId, projectId: item.projectId, title: item.title, chunk, embedding });
        chunks++;
      }
    }
    return { documents: items.length, chunks };
  }

  async stats(workspaceId: string) {
    const total = await this.embeddingModel.countDocuments({ workspaceId }).exec();
    const last = await this.embeddingModel.findOne({ workspaceId }, { updatedAt: 1 }).sort({ updatedAt: -1 }).lean().exec();
    return { chunks: total, lastIndexedAt: last?.updatedAt ?? null };
  }
}
