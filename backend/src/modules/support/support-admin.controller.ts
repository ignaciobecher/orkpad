import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SupportService } from './support.service';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { QuerySupportMessagesDto } from './dto/query-support-messages.dto';
import { QuerySupportConversationsDto } from './dto/query-support-conversations.dto';

@ApiTags('Support Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/support')
export class SupportAdminController {
  constructor(private readonly supportService: SupportService) {}

  @Get('conversations')
  @ApiOperation({
    summary: 'Listar todas las conversaciones de soporte (admin, cross-tenant)',
  })
  findAllConversations(@Query() query: QuerySupportConversationsDto) {
    return this.supportService.findAllConversationsForAdmin(query);
  }

  @Get('conversations/:id')
  @ApiOperation({
    summary: 'Obtener una conversación de soporte por ID (admin)',
  })
  findConversation(@Param('id') id: string) {
    return this.supportService.findConversationForAdmin(id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({
    summary: 'Listar mensajes paginados de una conversación (admin)',
  })
  findMessages(
    @Param('id') id: string,
    @Query() query: QuerySupportMessagesDto,
  ) {
    return this.supportService.findMessagesForAdmin(id, query);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({
    summary: 'Responder como admin en una conversación de soporte',
  })
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateSupportMessageDto,
  ) {
    return this.supportService.sendAdminMessage(id, user.userId, dto);
  }

  @Patch('conversations/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar una conversación como leída por el admin' })
  markRead(@Param('id') id: string) {
    return this.supportService.markConversationReadForAdmin(id);
  }

  @Get('unread-count')
  @ApiOperation({
    summary:
      'Total de mensajes no leídos por el admin, entre todas las conversaciones',
  })
  getUnreadCount() {
    return this.supportService.getAdminUnreadTotal();
  }
}
