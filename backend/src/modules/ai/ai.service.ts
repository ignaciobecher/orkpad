import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Response } from 'express';
import { AiConversation, AiConversationDocument } from './ai-conversation.schema';
import { AiMessage, AiMessageDocument } from './ai-message.schema';
import { AiSettings, AiSettingsDocument } from './ai-settings.schema';
import { OllamaService } from './ollama.service';
import { AiIndexService } from './ai-index.service';
import { AiContextService } from './ai-context.service';
import { ChatDto } from './dto/chat.dto';
import { UpdateAiSettingsDto } from './dto/update-ai-settings.dto';

const DEFAULT_SYSTEM = `Sos el asistente de Orkpad, una app de gestión para freelancers y agencias.
Respondés en español, corto y con datos concretos.
Solo podés usar el CONTEXTO que se te da abajo. Si la respuesta no está en el contexto, decilo explícitamente y sugerí dónde buscarlo.
Nunca inventes montos, fechas ni estados.`;

@Injectable()
export class AiService {
  constructor(
    @InjectModel(AiConversation.name) private readonly conversationModel: Model<AiConversationDocument>,
    @InjectModel(AiMessage.name) private readonly messageModel: Model<AiMessageDocument>,
    @InjectModel(AiSettings.name) private readonly settingsModel: Model<AiSettingsDocument>,
    private readonly ollama: OllamaService,
    private readonly index: AiIndexService,
    private readonly context: AiContextService,
  ) {}

  async getSettings(workspaceId: string) {
    const cfg = await this.index.settings(workspaceId);
    const stats = await this.index.stats(workspaceId).catch(() => ({ chunks: 0, lastIndexedAt: null }));
    return { ...cfg, index: stats };
  }

  async updateSettings(workspaceId: string, dto: UpdateAiSettingsDto) {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(dto)) {
      if (v !== undefined) clean[k] = v;
    }
    await this.settingsModel
      .findOneAndUpdate({ workspaceId }, { $set: clean }, { upsert: true })
      .exec();
    return this.getSettings(workspaceId);
  }

  async testConnection(workspaceId: string, baseUrl?: string) {
    const cfg = await this.index.settings(workspaceId);
    const url = this.ollama.normalizeUrl(baseUrl ?? cfg.ollamaBaseUrl);
    return { url, ...(await this.ollama.test(url)) };
  }

  async listModels(workspaceId: string, baseUrl?: string) {
    const cfg = await this.index.settings(workspaceId);
    const url = this.ollama.normalizeUrl(baseUrl ?? cfg.ollamaBaseUrl);
    return this.ollama.listModels(url);
  }

  async conversations(workspaceId: string, userId: string) {
    return this.conversationModel
      .find({ workspaceId, userId, isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean()
      .exec();
  }

  async messages(workspaceId: string, userId: string, id: string) {
    const conv = await this.conversationModel.findOne({ workspaceId, _id: id, userId, isDeleted: false }).lean().exec();
    if (!conv) throw new NotFoundException('Conversación no encontrada');
    return this.messageModel.find({ workspaceId, conversationId: id }).sort({ createdAt: 1 }).lean().exec();
  }

  async removeConversation(workspaceId: string, userId: string, id: string) {
    await this.conversationModel.findOneAndUpdate({ workspaceId, _id: id, userId }, { $set: { isDeleted: true } }).exec();
    await this.messageModel.updateMany({ workspaceId, conversationId: id }, { $set: { isDeleted: true } }).exec();
    return { success: true };
  }

  async reindex(workspaceId: string) {
    return this.index.reindex(workspaceId);
  }

  async chat(workspaceId: string, userId: string, dto: ChatDto, res: Response) {
    const cfg = await this.index.settings(workspaceId);
    if (!cfg.enabled) throw new BadRequestException('El asistente IA está desactivado');
    const baseUrl = this.ollama.normalizeUrl(cfg.ollamaBaseUrl);

    let conversation: any = null;
    if (dto.conversationId) {
      conversation = await this.conversationModel
        .findOne({ workspaceId, _id: dto.conversationId, userId, isDeleted: false })
        .exec();
      if (!conversation) throw new NotFoundException('Conversación no encontrada');
    }
    const projectId = dto.projectId ?? conversation?.projectId ?? null;
    if (!conversation) {
      conversation = await this.conversationModel.create({
        workspaceId,
        userId,
        title: dto.message.slice(0, 80),
        projectId,
      });
    }

    await this.messageModel.create({ workspaceId, conversationId: conversation._id.toString(), role: 'user', content: dto.message });
    const history = await this.messageModel
      .find({ workspaceId, conversationId: conversation._id.toString() })
      .sort({ createdAt: -1 })
      .limit(11)
      .lean()
      .exec();

    const sources = await this.index.retrieve(workspaceId, dto.message, projectId ?? undefined).catch(() => []);
    const contextParts = [
      projectId
        ? await this.context.projectContext(workspaceId, projectId).catch(() => '')
        : await this.context.workspaceContext(workspaceId).catch(() => ''),
      sources.length
        ? `NOTAS Y DATOS RELEVANTES:\n${sources.map((s, i) => `[${i + 1}] (${s.refType}) ${s.title}: ${s.chunk}`).join('\n')}`
        : 'Sin notas relevantes indexadas.',
    ];
    const system = `${cfg.systemPrompt ?? DEFAULT_SYSTEM}\n\nCONTEXTO:\n${contextParts.join('\n')}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(`event: meta\ndata: ${JSON.stringify({ conversationId: conversation._id.toString() })}\n\n`);

    let full = '';
    try {
      full = await this.ollama.chat(
        baseUrl,
        cfg.chatModel,
        [
          { role: 'system', content: system },
          ...history.reverse().slice(0, 10).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          { role: 'user', content: dto.message },
        ],
        cfg.temperature,
        (token) => {
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        },
      );
    } catch (err: any) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: err.message ?? 'Error de Ollama' })}\n\n`);
      res.end();
      return;
    }

    await this.messageModel.create({
      workspaceId,
      conversationId: conversation._id.toString(),
      role: 'assistant',
      content: full,
      sources: sources.map((s) => ({ refType: s.refType, refId: s.refId, title: s.title, chunk: s.chunk.slice(0, 300) })),
    });
    await this.conversationModel.findByIdAndUpdate(conversation._id, { $set: { updatedAt: new Date() } }).exec();
    res.write(`event: done\ndata: ${JSON.stringify({ sources: sources.map((s, i) => ({ n: i + 1, refType: s.refType, title: s.title })) })}\n\n`);
    res.end();
  }
}
