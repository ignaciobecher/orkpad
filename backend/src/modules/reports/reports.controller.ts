import {
  Controller,
  Get,
  Query,
  UseGuards,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { ReportsService } from './reports.service';
import { ReportsExportService } from './reports-export.service';
import { QueryReportDto } from './dto/query-report.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportService: ReportsExportService,
  ) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumen financiero, de tareas, proyectos y horas del período' })
  summary(@WorkspaceId() workspaceId: string, @Query() query: QueryReportDto) {
    return this.reportsService.summary(workspaceId, query);
  }

  @Get('export.csv')
  @ApiOperation({ summary: 'Exportar el reporte del período en CSV' })
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@WorkspaceId() workspaceId: string, @Query() query: QueryReportDto) {
    const data = await this.reportsService.summary(workspaceId, query);
    const csv = this.exportService.toCsv(data);
    return new StreamableFile(Buffer.from('\uFEFF' + csv, 'utf8'), {
      type: 'text/csv; charset=utf-8',
      disposition: 'attachment; filename="reporte.csv"',
    });
  }

  @Get('export.pdf')
  @ApiOperation({ summary: 'Exportar el reporte del período en PDF' })
  @Header('Content-Type', 'application/pdf')
  async exportPdf(@WorkspaceId() workspaceId: string, @Query() query: QueryReportDto) {
    const data = await this.reportsService.summary(workspaceId, query);
    const pdf = await this.exportService.toPdf(data);
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: 'attachment; filename="reporte.pdf"',
    });
  }
}
