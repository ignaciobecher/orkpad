import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { QueryUserDto } from './dto/query-user.dto';
import { SendMarketingDto } from './dto/send-marketing.dto';
import { UsersService } from './users.service';
import { MailService } from '../mail/mail.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users in the workspace' })
  findAll(@WorkspaceId() workspaceId: string, @Query() query: QueryUserDto) {
    return this.usersService.findAllByWorkspace(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID in the workspace' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.usersService.findWorkspaceMemberByIdOrThrow(workspaceId, id);
  }
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all users (admin only)' })
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Post(':id/send-followup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a follow-up email to a user (admin only)' })
  async sendFollowUp(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    await this.mailService.sendFollowUpEmail(user.email, user.name);
    return { message: `Follow-up email sent to ${user.email}` };
  }

  @Post('send-marketing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a marketing email to all users (admin only)' })
  async sendMarketing(@Body() dto: SendMarketingDto) {
    const result = await this.usersService.findAll({ limit: 1000 });
    let sent = 0;
    for (const user of result.data) {
      await this.mailService.sendMarketingEmail(
        user.email,
        user.name,
        dto.templateId,
      );
      sent++;
    }
    return { sent, total: result.total, templateId: dto.templateId };
  }
}
