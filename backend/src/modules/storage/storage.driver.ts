import type { Readable } from 'stream';

export interface StoredFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface StorageDriver {
  save(
    workspaceId: string,
    file: { buffer: Buffer; originalName: string; mimeType: string },
  ): Promise<StoredFile>;
  read(workspaceId: string, id: string): Promise<{ stream: Readable; mimeType: string; size: number }>;
  remove(workspaceId: string, id: string): Promise<void>;
}
