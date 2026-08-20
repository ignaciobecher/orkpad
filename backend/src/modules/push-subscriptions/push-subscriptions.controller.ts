import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { UnsubscribePushDto } from './dto/unsubscribe-push.dto';

@ApiTags('Push Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('push-subscriptions')
export class PushSubscriptionsController {
  constructor(
    private readonly pushSubscriptionsService: PushSubscriptionsService,
  ) {}

  @Get('vapid-public-key')
  @ApiOperation({
    summary: 'Get VAPID public key for subscribing to push notifications',
  })
  getVapidPublicKey() {
    const publicKey = this.pushSubscriptionsService.getVapidPublicKey();
    return { publicKey: publicKey ?? null, enabled: !!publicKey };
  }

  @Post()
  @ApiOperation({ summary: 'Register or update a browser push subscription' })
  subscribe(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreatePushSubscriptionDto,
    @Req() req: any,
  ) {
    const userAgent = req.headers['user-agent'];
    return this.pushSubscriptionsService.subscribe(workspaceId, user.userId, {
      ...dto,
      userAgent: userAgent?.substring(0, 200),
    });
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a browser push subscription' })
  unsubscribe(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: UnsubscribePushDto,
  ) {
    return this.pushSubscriptionsService.unsubscribe(
      workspaceId,
      user.userId,
      dto.endpoint,
    );
  }
}
