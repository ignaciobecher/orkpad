import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { QueryConversationsDto } from './dto/query-conversations.dto';

@ApiTags('Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get()
  @ApiOperation({
    summary:
      'Listar todas las conversaciones del workspace, ordenadas por último mensaje',
  })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryConversationsDto,
  ) {
    return this.messagingService.findAllConversations(workspaceId, query);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva conversación (iniciada por el admin)',
  })
  create(
    @WorkspaceId() workspaceId: string,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagingService.createConversation(workspaceId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una conversación por ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.messagingService.findConversation(workspaceId, id);
  }

  @Get(':id/messages')
  @ApiOperation({
    summary:
      'Listar mensajes paginados de una conversación (más nuevos primero)',
  })
  findMessages(
    @WorkspaceId() workspaceId: string,
    @Param('id') conversationId: string,
    @Query() query: QueryMessagesDto,
  ) {
    return this.messagingService.findMessages(
      workspaceId,
      conversationId,
      query,
    );
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Enviar un mensaje como admin' })
  sendMessage(
    @WorkspaceId() workspaceId: string,
    @Param('id') conversationId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagingService.sendAdminMessage(
      workspaceId,
      conversationId,
      user.userId,
      dto,
    );
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Marcar todos los mensajes de una conversación como leídos (resetea unreadCount)',
  })
  markRead(
    @WorkspaceId() workspaceId: string,
    @Param('id') conversationId: string,
  ) {
    return this.messagingService.markConversationRead(
      workspaceId,
      conversationId,
    );
  }
}
