import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SupportService } from './support.service';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { QuerySupportMessagesDto } from './dto/query-support-messages.dto';

@ApiTags('Support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support/conversation')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener (o crear) mi conversación de soporte con Orkpad',
  })
  getMyConversation(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: any,
  ) {
    return this.supportService.getOrCreateMyConversation(
      workspaceId,
      user.userId,
    );
  }

  @Get('messages')
  @ApiOperation({
    summary: 'Listar mensajes paginados de mi conversación de soporte',
  })
  getMyMessages(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: any,
    @Query() query: QuerySupportMessagesDto,
  ) {
    return this.supportService.getMyMessages(workspaceId, user.userId, query);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Enviar un mensaje de soporte a Orkpad' })
  sendMessage(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateSupportMessageDto,
  ) {
    return this.supportService.sendCustomerMessage(
      workspaceId,
      user.userId,
      dto,
    );
  }
}
