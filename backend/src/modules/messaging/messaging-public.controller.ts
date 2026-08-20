import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';

@ApiTags('Messaging (Public)')
@Controller('public/conversations')
export class MessagingPublicController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get(':projectToken')
  @ApiOperation({
    summary:
      'Obtener o crear conversación de un proyecto via token público — sin autenticación',
  })
  getOrCreate(@Param('projectToken') projectToken: string) {
    return this.messagingService.getOrCreateConversationForProject(
      projectToken,
    );
  }

  @Get(':projectToken/messages')
  @ApiOperation({
    summary:
      'Listar mensajes de la conversación del proyecto — sin autenticación',
  })
  findMessages(
    @Param('projectToken') projectToken: string,
    @Query() query: QueryMessagesDto,
  ) {
    return this.messagingService.findPublicMessages(projectToken, query);
  }

  @Post(':projectToken/messages')
  @ApiOperation({
    summary:
      'Enviar un mensaje como cliente via token público del proyecto — sin autenticación',
  })
  async sendMessage(
    @Param('projectToken') projectToken: string,
    @Body() dto: CreateMessageDto,
  ) {
    const result = await this.messagingService.sendClientMessage(
      projectToken,
      dto,
    );
    return result.message;
  }
}
