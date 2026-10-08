import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { AiEmbedding, AiEmbeddingDocument } from './ai-embedding.schema';
import { AiSettings, AiSettingsDocument } from './ai-settings.schema';
import { Note, NoteDocument } from '../notes/note.schema';
import { Document, DocumentDocument } from '../docs/docs.schema';
import { Task, TaskDocument } from '../tasks/tasks.schema';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { Invoice, InvoiceDocument } from '../invoices/invoices.schema';
import { OllamaService } from './ollama.service';

const CHUNK_SIZE = 1000;

export interface ReindexJob {
  id: string;
  status: 'running' | 'done' | 'failed';
  total: number;
  done: number;
  documents: number;
  error?: string;
  startedAt: Date;
  finishedAt?: Date;
}

const EMBED_TIMEOUT_MS = 300000;
const EMBED_RETRIES = 2;

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

  private itemFromDoc(
    refType: string,
    doc: any,
  ): { refType: string; refId: string; projectId: string | null; title: string; text: string } | null {
    const refId = doc._id?.toString();
    if (!refId) return null;
    switch (refType) {
      case 'note':
        return { refType, refId, projectId: doc.projectId ?? null, title: doc.title ?? 'Nota', text: `${doc.title ?? ''}\n${this.stripHtml(doc.content)}` };
      case 'doc': {
        let text = doc.content ?? '';
        try {
          const parsed = JSON.parse(text);
          text = parsed.text ?? parsed.data ?? text;
          if (typeof text !== 'string' || text.startsWith('data:')) text = doc.title ?? '';
        } catch {
          // texto plano
        }
        return { refType, refId, projectId: doc.projectId ?? null, title: doc.title ?? 'Documento', text: `${doc.title ?? ''}\n${this.stripHtml(text)}` };
      }
      case 'task':
        return { refType, refId, projectId: doc.projectId ?? null, title: doc.title, text: `${doc.title}\n${this.stripHtml(doc.description ?? '')} (estado: ${doc.status})` };
      case 'project':
        return { refType, refId, projectId: refId, title: doc.name, text: `${doc.name}\n${doc.description ?? ''} (estado: ${doc.status}, presupuesto: ${doc.budget ?? 0})` };
      case 'invoice':
        return { refType, refId, projectId: doc.projectId ?? null, title: `Factura ${doc.number ?? ''}`, text: `Factura ${doc.number ?? ''} total ${doc.total ?? 0} estado ${doc.status} vence ${doc.dueDate ?? 's/d'}` };
      default:
        return null;
    }
  }

  private async storeChunks(
    workspaceId: string,
    baseUrl: string,
    embedModel: string,
    item: { refType: string; refId: string; projectId: string | null; title: string; text: string },
  ): Promise<number> {
    let count = 0;
    for (const chunk of this.chunkText(item.text)) {
      const embedding = await this.embedWithRetry(baseUrl, embedModel, chunk);
      await this.embeddingModel.create({ workspaceId, refType: item.refType, refId: item.refId, projectId: item.projectId, title: item.title, chunk, embedding });
      count++;
    }
    return count;
  }

  private async embedWithRetry(baseUrl: string, model: string, text: string): Promise<number[]> {
    let lastErr: any = null;
    for (let attempt = 0; attempt < EMBED_RETRIES; attempt++) {
      try {
        return await this.ollama.embed(baseUrl, model, text, EMBED_TIMEOUT_MS);
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr;
  }

  private jobs = new Map<string, ReindexJob>();

  getJob(workspaceId: string, id: string): ReindexJob | null {
    const job = this.jobs.get(`${workspaceId}:${id}`);
    return job ?? null;
  }

  /** Inicia reindex en segundo plano y devuelve el job para polling. */
  startReindex(workspaceId: string): ReindexJob {
    const job: ReindexJob = {
      id: crypto.randomBytes(8).toString('hex'),
      status: 'running',
      total: 0,
      done: 0,
      documents: 0,
      startedAt: new Date(),
    };
    this.jobs.set(`${workspaceId}:${job.id}`, job);
    void this.runReindex(workspaceId, job).catch(() => {});
    return job;
  }

  private async runReindex(workspaceId: string, job: ReindexJob): Promise<void> {
    try {
      const cfg = await this.settings(workspaceId);
      const baseUrl = this.ollama.normalizeUrl(cfg.ollamaBaseUrl);
      const types = new Set(cfg.indexTypes);
      const items: { refType: string; refId: string; projectId: string | null; title: string; text: string }[] = [];

      const push = (refType: string, docs: any[], build: (d: any) => any) => {
        if (!types.has(refType)) return;
        for (const d of docs) {
          const item = build(d);
          if (item) items.push(item);
        }
      };
      push('note', await this.noteModel.find({ workspaceId, isDeleted: false }, { title: 1, content: 1, projectId: 1 }).lean().exec(), (d) => this.itemFromDoc('note', d));
      push('doc', await this.docModel.find({ workspaceId, isDeleted: false }, { title: 1, content: 1, projectId: 1 }).lean().exec(), (d) => this.itemFromDoc('doc', d));
      push('task', await this.taskModel.find({ workspaceId, isDeleted: false }, { title: 1, description: 1, projectId: 1, status: 1 }).lean().exec(), (d) => this.itemFromDoc('task', d));
      push('project', await this.projectModel.find({ workspaceId, isDeleted: false }, { name: 1, description: 1, status: 1, budget: 1 }).lean().exec(), (d) => this.itemFromDoc('project', d));
      push('invoice', await this.invoiceModel.find({ workspaceId, isDeleted: false }, { number: 1, status: 1, total: 1, dueDate: 1, projectId: 1 }).lean().exec(), (d) => this.itemFromDoc('invoice', d));

      // Estimación para la barra: 1 chunk cada ~600 caracteres.
      job.total = items.reduce((s, i) => s + Math.max(1, Math.ceil((i.text?.length ?? 0) / 600)), 0);
      job.documents = items.length;

      await this.embeddingModel.deleteMany({ workspaceId }).exec();
      let done = 0;
      for (const item of items) {
        for (const chunk of this.chunkText(item.text)) {
          const embedding = await this.embedWithRetry(baseUrl, cfg.embedModel, chunk);
          await this.embeddingModel.create({ workspaceId, refType: item.refType, refId: item.refId, projectId: item.projectId, title: item.title, chunk, embedding });
          done++;
          job.done = done;
        }
      }
      job.status = 'done';
      job.finishedAt = new Date();
    } catch (err: any) {
      job.status = 'failed';
      job.error = err?.message ?? 'Error desconocido';
      job.finishedAt = new Date();
    }
  }

  private async loadDoc(refType: string, workspaceId: string, refId: string): Promise<any> {
    const filter = { workspaceId, _id: refId, isDeleted: false };
    switch (refType) {
      case 'note':
        return this.noteModel.findOne(filter, { title: 1, content: 1, projectId: 1 }).lean().exec();
      case 'doc':
        return this.docModel.findOne(filter, { title: 1, content: 1, projectId: 1 }).lean().exec();
      case 'task':
        return this.taskModel.findOne(filter, { title: 1, description: 1, projectId: 1, status: 1 }).lean().exec();
      case 'project':
        return this.projectModel.findOne(filter, { name: 1, description: 1, status: 1, budget: 1 }).lean().exec();
      case 'invoice':
        return this.invoiceModel.findOne(filter, { number: 1, status: 1, total: 1, dueDate: 1, projectId: 1 }).lean().exec();
      default:
        return null;
    }
  }

  /** Reindexa un único documento (creación/edición) o borra sus vectores (eliminado). */
  async indexOne(workspaceId: string, refType: string, refId: string, deleted = false): Promise<void> {
    const cfg = await this.settings(workspaceId).catch(() => null);
    if (!cfg || !cfg.enabled || !cfg.indexTypes.includes(refType)) return;
    await this.embeddingModel.deleteMany({ workspaceId, refType, refId }).exec();
    if (deleted) return;
    const doc = await this.loadDoc(refType, workspaceId, refId).catch(() => null);
    if (!doc) return;
    const item = this.itemFromDoc(refType, doc);
    if (!item) return;
    const baseUrl = this.ollama.normalizeUrl(cfg.ollamaBaseUrl);
    await this.storeChunks(workspaceId, baseUrl, cfg.embedModel, item).catch(() => {});
  }

  private pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

  /** Aviso fire-and-forget desde los servicios: no bloquea el request y
   *  coalescea ediciones rápidas del mismo documento (2s). */
  notifyChanged(workspaceId: string, refType: string, refId: string, deleted = false): void {
    const key = `${workspaceId}:${refType}:${refId}`;
    const prev = this.pendingTimers.get(key);
    if (prev) clearTimeout(prev);
    const timer = setTimeout(() => {
      this.pendingTimers.delete(key);
      this.indexOne(workspaceId, refType, refId, deleted).catch(() => {});
    }, 2000);
    this.pendingTimers.set(key, timer);
  }

  async stats(workspaceId: string) {
    const total = await this.embeddingModel.countDocuments({ workspaceId }).exec();
    const last = await this.embeddingModel.findOne({ workspaceId }, { updatedAt: 1 }).sort({ updatedAt: -1 }).lean().exec();
    return { chunks: total, lastIndexedAt: last?.updatedAt ?? null };
  }
}
