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
import { DocumentsService } from './docs.service';
import { CreateDocumentDto } from './dto/create-doc.dto';
import { UpdateDocumentDto } from './dto/update-doc.dto';
import { QueryDocumentDto } from './dto/query-doc.dto';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('docs')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all docs' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryDocumentDto,
  ) {
    return this.service.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.service.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new' })
  create(@WorkspaceId() workspaceId: string, @Body() dto: CreateDocumentDto) {
    return this.service.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.service.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.service.remove(workspaceId, id);
  }
}
