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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all invoices in the workspace' })
  findAll(@WorkspaceId() workspaceId: string, @Query() query: QueryInvoiceDto) {
    return this.invoicesService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.invoicesService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  create(@WorkspaceId() workspaceId: string, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete an invoice' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.invoicesService.remove(workspaceId, id);
  }
}
