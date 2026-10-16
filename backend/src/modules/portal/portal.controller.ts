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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  StreamableFile,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PortalService } from './portal.service';
import { PortalAuthGuard } from './portal-auth.guard';
import { PortalCtx, type PortalContext } from './portal-context.decorator';

const MULTER_PORTAL_LIMIT = 100 * 1024 * 1024;

@ApiTags('PortalPublic')
@Controller('portal')
export class PortalPublicController {
  constructor(private readonly portalService: PortalService) {}

  @Post('login')
  @ApiOperation({ summary: 'Client portal login (username + password)' })
  login(@Body() dto: { username: string; password: string }) {
    return this.portalService.login(dto.username ?? '', dto.password ?? '');
  }

  @Get('share-info/:token')
  @ApiOperation({ summary: 'Public info for a private link (project + username)' })
  shareInfo(@Param('token') token: string) {
    return this.portalService.shareInfo(token);
  }
}

@ApiTags('Portal')
@Controller('portal')
@UseGuards(PortalAuthGuard)
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('project')
  @ApiOperation({ summary: 'Get the shared project (sanitized)' })
  getProject(@PortalCtx() ctx: PortalContext) {
    return this.portalService.getProject(ctx);
  }

  @Get('columns')
  @ApiOperation({ summary: 'List board columns' })
  getColumns(@PortalCtx() ctx: PortalContext) {
    return this.portalService.getColumns(ctx);
  }

  @Get('tasks')
  @ApiOperation({ summary: 'List project tasks' })
  getTasks(
    @PortalCtx() ctx: PortalContext,
    @Query('archived') archived?: string,
  ) {
    return this.portalService.getTasks(
      ctx,
      archived === 'true' || archived === '1',
    );
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create a task (perm canCreate)' })
  createTask(@PortalCtx() ctx: PortalContext, @Body() dto: any) {
    return this.portalService.createTask(ctx, dto);
  }

  @Patch('tasks/:taskId')
  @ApiOperation({ summary: 'Update a task (perm canEdit)' })
  updateTask(
    @PortalCtx() ctx: PortalContext,
    @Param('taskId') taskId: string,
    @Body() dto: any,
  ) {
    return this.portalService.updateTask(ctx, taskId, dto);
  }

  @Patch('tasks/:taskId/move')
  @ApiOperation({ summary: 'Move a task (perm canEdit)' })
  moveTask(
    @PortalCtx() ctx: PortalContext,
    @Param('taskId') taskId: string,
    @Body() dto: any,
  ) {
    return this.portalService.moveTask(ctx, taskId, dto);
  }

  @Get('tasks/:taskId/comments')
  @ApiOperation({ summary: 'List task comments' })
  listComments(
    @PortalCtx() ctx: PortalContext,
    @Param('taskId') taskId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.portalService.listComments(ctx, taskId, page, limit);
  }

  @Post('tasks/:taskId/comments')
  @ApiOperation({ summary: 'Add a comment (perm canComment)' })
  addComment(
    @PortalCtx() ctx: PortalContext,
    @Param('taskId') taskId: string,
    @Body() dto: any,
  ) {
    return this.portalService.addComment(ctx, taskId, dto);
  }

  @Patch('tasks/:taskId/comments/:commentId')
  @ApiOperation({ summary: 'Edit own comment' })
  updateComment(
    @PortalCtx() ctx: PortalContext,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Body() dto: any,
  ) {
    return this.portalService.updateComment(ctx, taskId, commentId, dto);
  }

  @Delete('tasks/:taskId/comments/:commentId')
  @ApiOperation({ summary: 'Delete own comment' })
  removeComment(
    @PortalCtx() ctx: PortalContext,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.portalService.removeComment(ctx, taskId, commentId);
  }

  @Get('tasks/:taskId/activities')
  @ApiOperation({ summary: 'List task activity' })
  listActivities(
    @PortalCtx() ctx: PortalContext,
    @Param('taskId') taskId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.portalService.listActivities(ctx, taskId, page, limit);
  }

  @Post('tasks/:taskId/attachments')
  @ApiOperation({ summary: 'Upload an attachment (perm canUpload)' })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MULTER_PORTAL_LIMIT } }),
  )
  addAttachment(
    @PortalCtx() ctx: PortalContext,
    @Param('taskId') taskId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Falta el archivo (campo file)');
    return this.portalService.addAttachment(ctx, taskId, {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });
  }

  @Delete('tasks/:taskId/attachments/:fileId')
  @ApiOperation({ summary: 'Remove an attachment (perm canUpload)' })
  removeAttachment(
    @PortalCtx() ctx: PortalContext,
    @Param('taskId') taskId: string,
    @Param('fileId') fileId: string,
  ) {
    return this.portalService.removeAttachment(ctx, taskId, fileId);
  }

  @Get('tasks/:taskId/files/:fileId')
  @ApiOperation({ summary: 'Download a task attachment' })
  async download(
    @PortalCtx() ctx: PortalContext,
    @Param('taskId') taskId: string,
    @Param('fileId') fileId: string,
  ) {
    const { stream, mimeType, size } =
      await this.portalService.downloadAttachment(ctx, taskId, fileId);
    return new StreamableFile(stream, {
      type: mimeType,
      disposition: 'inline',
      length: size,
    });
  }
}
