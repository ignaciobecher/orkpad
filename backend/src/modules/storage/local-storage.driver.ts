import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { StoredFile, StorageDriver } from './storage.driver';

const SAFE_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/mp4',
  'audio/ogg',
]);

export class LocalStorageDriver implements StorageDriver {
  constructor(private readonly baseDir: string) {}

  private workspaceDir(workspaceId: string) {
    return path.join(this.baseDir, workspaceId);
  }

  private filePath(workspaceId: string, id: string) {
    // id is a generated token, never a user path — no traversal possible.
    if (!/^[a-f0-9]{32}$/.test(id)) {
      throw new BadRequestException('Invalid file id');
    }
    return path.join(this.workspaceDir(workspaceId), id);
  }

  async save(
    workspaceId: string,
    file: { buffer: Buffer; originalName: string; mimeType: string },
  ): Promise<StoredFile> {
    if (!SAFE_MIME.has(file.mimeType)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido: ${file.mimeType}`,
      );
    }
    const dir = this.workspaceDir(workspaceId);
    await fs.promises.mkdir(dir, { recursive: true });
    const id = crypto.randomBytes(16).toString('hex');
    const meta = {
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.buffer.length,
    };
    await fs.promises.writeFile(path.join(dir, id), file.buffer);
    await fs.promises.writeFile(
      path.join(dir, `${id}.json`),
      JSON.stringify(meta),
    );
    return { id, ...meta, url: `/files/${id}` };
  }

  async read(workspaceId: string, id: string) {
    const filePath = this.filePath(workspaceId, id);
    const metaPath = `${filePath}.json`;
    try {
      const meta = JSON.parse(
        await fs.promises.readFile(metaPath, 'utf8'),
      ) as { originalName: string; mimeType: string; size: number };
      const stat = await fs.promises.stat(filePath);
      return {
        stream: fs.createReadStream(filePath),
        mimeType: meta.mimeType,
        size: stat.size,
      };
    } catch {
      throw new NotFoundException('Archivo no encontrado');
    }
  }

  async remove(workspaceId: string, id: string): Promise<void> {
    const filePath = this.filePath(workspaceId, id);
    await fs.promises.unlink(filePath).catch(() => {});
    await fs.promises.unlink(`${filePath}.json`).catch(() => {});
  }
}
