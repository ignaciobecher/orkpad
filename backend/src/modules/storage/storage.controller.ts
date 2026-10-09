import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Header,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { StorageService } from './storage.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

const MULTER_HARD_LIMIT = 1024 * 1024 * 1024;
const DEFAULT_MAX_MB = 200;

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Subir un archivo al storage del workspace' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MULTER_HARD_LIMIT },
    }),
  )
  async upload(
    @WorkspaceId() workspaceId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Falta el archivo (campo file)');
    const ws = await this.workspacesService.findById(workspaceId).catch(() => null);
    const maxMb = (ws as any)?.maxUploadMb ?? DEFAULT_MAX_MB;
    if (file.size > maxMb * 1024 * 1024) {
      throw new BadRequestException(
        `El archivo supera el tope de ${maxMb} MB configurado en este workspace`,
      );
    }
    return this.storageService.save(workspaceId, {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Descargar un archivo del workspace' })
  async download(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    const { stream, mimeType, size } = await this.storageService.read(
      workspaceId,
      id,
    );
    return new StreamableFile(stream, {
      type: mimeType,
      disposition: 'inline',
      length: size,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un archivo del workspace' })
  async remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    await this.storageService.remove(workspaceId, id);
    return { success: true };
  }
}
