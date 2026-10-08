import { Injectable, BadRequestException } from '@nestjs/common';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class OllamaService {
  normalizeUrl(raw?: string | null) {
    const url = (raw ?? process.env.OLLAMA_BASE_URL ?? 'http://ollama:11434').trim();
    if (!url) throw new BadRequestException('Ollama no configurado');
    return url.replace(/\/+$/, '');
  }

  async listModels(baseUrl: string) {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new BadRequestException(`Ollama respondió ${res.status}`);
    const data = (await res.json()) as any;
    return (data.models ?? []).map((m: any) => ({
      name: m.name,
      size: m.size,
      modifiedAt: m.modified_at,
    }));
  }

  async test(baseUrl: string) {
    const models = await this.listModels(baseUrl).catch(() => null);
    if (!models) throw new BadRequestException('No se pudo conectar a Ollama');
    return { ok: true, models: models.length };
  }

  async embed(baseUrl: string, model: string, text: string, timeoutMs = 60000): Promise<number[]> {
    const res = await fetch(`${baseUrl}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input: text }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new BadRequestException(`Embed falló (${res.status}): ${body.slice(0, 200)}`);
    }
    const data = (await res.json()) as any;
    const vec = data.embeddings?.[0];
    if (!Array.isArray(vec)) throw new BadRequestException('Ollama no devolvió embeddings');
    return vec;
  }

  async chat(
    baseUrl: string,
    model: string,
    messages: OllamaMessage[],
    temperature: number,
    onToken: (token: string) => void,
  ): Promise<string> {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // num_predict acota el largo: en CPU cada token cuesta segundos.
      body: JSON.stringify({ model, messages, temperature, stream: true, options: { num_predict: 500 } }),
      signal: AbortSignal.timeout(300000),
    });
    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => '');
      throw new BadRequestException(`Chat falló (${res.status}): ${body.slice(0, 200)}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    let buf = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const chunk = JSON.parse(trimmed);
          const token = chunk.message?.content ?? '';
          if (token) {
            full += token;
            onToken(token);
          }
          if (chunk.done) {
            await reader.cancel().catch(() => {});
            return full;
          }
        } catch {
          // línea parcial: se ignora
        }
      }
    }
    return full;
  }
}
