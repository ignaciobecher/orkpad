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
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNoteDto } from './dto/query-note.dto';
import { ReorderNotesDto } from './dto/reorder-notes.dto';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'List all notes in the workspace' })
  findAll(@WorkspaceId() workspaceId: string, @Query() query: QueryNoteDto) {
    return this.notesService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a note by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.notesService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  create(@WorkspaceId() workspaceId: string, @Body() dto: CreateNoteDto) {
    return this.notesService.create(workspaceId, dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Bulk update note order' })
  reorder(@WorkspaceId() workspaceId: string, @Body() dto: ReorderNotesDto) {
    return this.notesService.reorder(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(workspaceId, id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle note status between active and done' })
  toggle(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.notesService.toggle(workspaceId, id);
  }

  @Patch(':id/pin')
  @ApiOperation({ summary: 'Toggle note pin state' })
  pin(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.notesService.pin(workspaceId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a note' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.notesService.remove(workspaceId, id);
  }
}
