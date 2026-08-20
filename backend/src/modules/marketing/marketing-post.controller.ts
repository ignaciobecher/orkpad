import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Res,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MarketingPostService } from './marketing-post.service';
import { MarketingDashboardService } from './marketing-dashboard.service';
import { ExcelImportService } from './excel-import.service';
import { CreateMarketingPostDto } from './dto/create-marketing-post.dto';
import { UpdateMarketingPostDto } from './dto/update-marketing-post.dto';
import { QueryMarketingPostDto } from './dto/query-marketing-post.dto';
import { RecordPostMetricsDto } from './dto/record-post-metrics.dto';
import { ImportMarketingPostsDto } from './dto/import-marketing-post.dto';

@ApiTags('Marketing - Posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('marketing/posts')
export class MarketingPostController {
  constructor(
    private readonly marketingPostService: MarketingPostService,
    private readonly marketingDashboardService: MarketingDashboardService,
    private readonly excelImportService: ExcelImportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar publicaciones' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryMarketingPostDto,
  ) {
    return this.marketingPostService.findAll(workspaceId, query);
  }

  @Get('calendar')
  @ApiOperation({
    summary: 'Obtener publicaciones programadas en un rango de fechas',
  })
  @ApiQuery({ name: 'from', required: true, example: '2026-06-01' })
  @ApiQuery({ name: 'to', required: true, example: '2026-06-30' })
  @ApiQuery({ name: 'network', required: false })
  calendar(
    @WorkspaceId() workspaceId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('network') network?: string,
  ) {
    return this.marketingPostService.findCalendar(
      workspaceId,
      from,
      to,
      network,
    );
  }

  @Get('dashboard')
  @ApiOperation({
    summary:
      'Obtener resumen y métricas agregadas para el dashboard de marketing',
  })
  dashboard(@WorkspaceId() workspaceId: string) {
    return this.marketingDashboardService.getStats(workspaceId);
  }

  @Get('import/template')
  @ApiOperation({
    summary: 'Descargar plantilla Excel para importación de publicaciones',
  })
  importTemplate(@Res() res: Response) {
    const buffer = this.excelImportService.generateTemplate();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="plantilla-importacion-posts.xlsx"',
    );
    res.send(buffer);
  }

  @Post('import/preview')
  @ApiOperation({
    summary: 'Previsualizar filas de un Excel importado sin persistir',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  importPreview(@UploadedFile() file: { buffer: Buffer }) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    return this.excelImportService.parseExcel(file.buffer);
  }

  @Post('import/confirm')
  @ApiOperation({
    summary: 'Confirmar y crear en lote las publicaciones importadas',
  })
  importConfirm(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: ImportMarketingPostsDto,
  ) {
    return this.marketingPostService.bulkCreate(
      workspaceId,
      user.userId,
      dto.posts,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una publicación por ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.marketingPostService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una publicación' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateMarketingPostDto,
  ) {
    return this.marketingPostService.create(workspaceId, user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una publicación' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMarketingPostDto,
  ) {
    return this.marketingPostService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar (soft-delete) una publicación' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.marketingPostService.remove(workspaceId, id);
  }

  @Post(':id/metrics')
  @ApiOperation({
    summary: 'Registrar métricas de rendimiento de una publicación publicada',
  })
  recordMetrics(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: RecordPostMetricsDto,
  ) {
    return this.marketingPostService.recordMetrics(workspaceId, id, dto);
  }
}
