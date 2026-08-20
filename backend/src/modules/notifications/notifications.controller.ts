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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all notifications for the current user' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: any,
    @Query() query: QueryNotificationDto,
  ) {
    return this.notificationsService.findAll(workspaceId, user.userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  getUnreadCount(@WorkspaceId() workspaceId: string, @CurrentUser() user: any) {
    return this.notificationsService.getUnreadCount(workspaceId, user.userId);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@WorkspaceId() workspaceId: string, @CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(workspaceId, user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  markAsRead(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.notificationsService.markAsRead(workspaceId, id);
  }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Mark a single notification as unread' })
  markAsUnread(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.notificationsService.markAsUnread(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notification (usually internal)' })
  create(
    @WorkspaceId() workspaceId: string,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(workspaceId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a notification' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.notificationsService.remove(workspaceId, id);
  }
}
