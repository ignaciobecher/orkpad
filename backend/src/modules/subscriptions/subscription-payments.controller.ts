import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { SubscriptionPaymentsService } from './subscription-payments.service';
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';
import { UpdateSubscriptionPaymentDto } from './dto/update-subscription-payment.dto';

@ApiTags('Subscription Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions/:subscriptionId/payments')
export class SubscriptionPaymentsController {
  constructor(private readonly service: SubscriptionPaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all payment periods for a subscription' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Param('subscriptionId') subscriptionId: string,
  ) {
    return this.service.findBySubscription(workspaceId, subscriptionId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new payment period to a subscription' })
  create(
    @WorkspaceId() workspaceId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: CreateSubscriptionPaymentDto,
  ) {
    return this.service.create(workspaceId, subscriptionId, dto);
  }

  @Patch(':id/mark-paid')
  @ApiOperation({ summary: 'Mark a payment period as paid' })
  markPaid(
    @WorkspaceId() workspaceId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Param('id') id: string,
  ) {
    return this.service.markPaid(workspaceId, subscriptionId, id);
  }

  @Patch(':id/mark-pending')
  @ApiOperation({ summary: 'Mark a payment period as pending' })
  markPending(
    @WorkspaceId() workspaceId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Param('id') id: string,
  ) {
    return this.service.markPending(workspaceId, subscriptionId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment period (notes, amount, dates)' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPaymentDto,
  ) {
    return this.service.update(workspaceId, subscriptionId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a payment period' })
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(workspaceId, subscriptionId, id);
  }
}
