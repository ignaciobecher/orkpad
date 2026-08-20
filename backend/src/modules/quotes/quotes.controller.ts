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
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QueryQuoteDto } from './dto/query-quote.dto';

@ApiTags('Quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @ApiOperation({ summary: 'List all quotes in the workspace' })
  findAll(@WorkspaceId() workspaceId: string, @Query() query: QueryQuoteDto) {
    return this.quotesService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quote by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.quotesService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new quote' })
  create(@WorkspaceId() workspaceId: string, @Body() dto: CreateQuoteDto) {
    return this.quotesService.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quote' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a quote' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.quotesService.remove(workspaceId, id);
  }

  @Post(':id/convert-to-invoice')
  @ApiOperation({ summary: 'Convert an accepted quote into a draft invoice' })
  @HttpCode(HttpStatus.CREATED)
  convertToInvoice(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.quotesService.convertToInvoice(workspaceId, id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate and download the quote PDF' })
  @ApiProduces('application/pdf')
  @HttpCode(HttpStatus.OK)
  async downloadPdf(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.quotesService.generatePdf(workspaceId, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="quote-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
