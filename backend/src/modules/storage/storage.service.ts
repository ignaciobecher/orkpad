import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { StorageDriver } from './storage.driver';
import { LocalStorageDriver } from './local-storage.driver';

@Injectable()
export class StorageService implements StorageDriver {
  private readonly driver: StorageDriver;

  constructor(configService: ConfigService) {
    // Único driver hoy: disco local. Para S3, agregar un S3StorageDriver
    // y elegirlo aquí con STORAGE_DRIVER=s3 (mismas credenciales S3_*).
    const baseDir =
      configService.get<string>('UPLOADS_DIR') ?? './uploads';
    this.driver = new LocalStorageDriver(baseDir);
  }

  save(
    workspaceId: string,
    file: { buffer: Buffer; originalName: string; mimeType: string },
  ) {
    return this.driver.save(workspaceId, file);
  }

  read(workspaceId: string, id: string) {
    return this.driver.read(workspaceId, id);
  }

  remove(workspaceId: string, id: string) {
    return this.driver.remove(workspaceId, id);
  }
}
