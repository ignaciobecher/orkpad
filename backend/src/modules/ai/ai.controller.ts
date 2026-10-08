import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { UpdateAiSettingsDto } from './dto/update-ai-settings.dto';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Configuración actual del asistente IA' })
  settings(@WorkspaceId() workspaceId: string) {
    return this.aiService.getSettings(workspaceId);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Guardar configuración del asistente IA' })
  updateSettings(@WorkspaceId() workspaceId: string, @Body() dto: UpdateAiSettingsDto) {
    return this.aiService.updateSettings(workspaceId, dto);
  }

  @Post('test')
  @ApiOperation({ summary: 'Probar conexión con Ollama' })
  test(@WorkspaceId() workspaceId: string, @Body() dto: { baseUrl?: string }) {
    return this.aiService.testConnection(workspaceId, dto?.baseUrl);
  }

  @Get('models')
  @ApiOperation({ summary: 'Listar modelos disponibles en Ollama' })
  models(@WorkspaceId() workspaceId: string, @Query('baseUrl') baseUrl?: string) {
    return this.aiService.listModels(workspaceId, baseUrl);
  }

  @Post('reindex')
  @ApiOperation({ summary: 'Iniciar reindexado en segundo plano (ver progreso por job)' })
  reindex(@WorkspaceId() workspaceId: string) {
    return this.aiService.reindex(workspaceId);
  }

  @Get('reindex/:jobId')
  @ApiOperation({ summary: 'Progreso del reindexado' })
  reindexStatus(@WorkspaceId() workspaceId: string, @Param('jobId') jobId: string) {
    return this.aiService.reindexStatus(workspaceId, jobId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Historial de conversaciones' })
  conversations(@WorkspaceId() workspaceId: string, @CurrentUser() user: { userId: string }) {
    return this.aiService.conversations(workspaceId, user.userId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Mensajes de una conversación' })
  messages(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.aiService.messages(workspaceId, user.userId, id);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Borrar una conversación' })
  removeConversation(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.aiService.removeConversation(workspaceId, user.userId, id);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Preguntar al asistente (streaming SSE)' })
  chat(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: ChatDto,
    @Res() res: Response,
  ) {
    return this.aiService.chat(workspaceId, user.userId, dto, res);
  }
}
