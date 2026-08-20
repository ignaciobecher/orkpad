import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GithubIntegrationService } from './github-integration.service';
import { GithubWebhookService } from './github-webhook.service';
import { ConnectRepoDto } from './dto/connect-repo.dto';

@ApiTags('github')
@Controller()
export class GithubIntegrationController {
  constructor(
    private readonly githubIntegrationService: GithubIntegrationService,
    private readonly githubWebhookService: GithubWebhookService,
    private readonly configService: ConfigService,
  ) {}

  @Get('github/repos')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List GitHub repos for the authenticated user' })
  getUserRepos(@CurrentUser() user: { userId: string }) {
    return this.githubIntegrationService.getUserRepos(user.userId);
  }

  @Post('github/projects/:projectId/connect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Link a GitHub repo to a project' })
  connectRepo(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: ConnectRepoDto,
  ) {
    return this.githubIntegrationService.connectRepo(
      workspaceId,
      projectId,
      dto,
    );
  }

  @Delete('github/projects/:projectId/connect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Unlink a GitHub repo from a project (?owner=&repo=)',
  })
  disconnectRepo(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Query('owner') owner: string,
    @Query('repo') repo: string,
  ) {
    return this.githubIntegrationService.disconnectRepo(
      workspaceId,
      projectId,
      owner,
      repo,
    );
  }

  @Get('github/projects/:projectId/commits')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get recent commits for a linked repo (?owner=&repo=)',
  })
  async getCommits(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @CurrentUser() user: { userId: string },
  ) {
    const repoInfo =
      owner && repo
        ? await this.githubIntegrationService.getProjectRepo(
            workspaceId,
            projectId,
            owner,
            repo,
          )
        : await this.githubIntegrationService.getFirstProjectRepo(
            workspaceId,
            projectId,
          );
    return this.githubIntegrationService.getRepoCommits(
      repoInfo.owner,
      repoInfo.repo,
      user.userId,
    );
  }

  @Get('github/projects/:projectId/pull-requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get open pull requests for a linked repo (?owner=&repo=)',
  })
  async getPullRequests(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @CurrentUser() user: { userId: string },
  ) {
    const repoInfo =
      owner && repo
        ? await this.githubIntegrationService.getProjectRepo(
            workspaceId,
            projectId,
            owner,
            repo,
          )
        : await this.githubIntegrationService.getFirstProjectRepo(
            workspaceId,
            projectId,
          );
    return this.githubIntegrationService.getOpenPRs(
      repoInfo.owner,
      repoInfo.repo,
      user.userId,
    );
  }

  @Get('github/projects/:projectId/repos')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all repos connected to a project' })
  getProjectRepos(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.githubIntegrationService.getProjectRepos(
      workspaceId,
      projectId,
    );
  }

  @Post('webhooks/github')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GitHub webhook receiver (push, pull_request)' })
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-github-event') event: string,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    const secret = this.configService.get<string>('GITHUB_WEBHOOK_SECRET');
    if (secret) {
      const rawBody: Buffer =
        req.rawBody ?? Buffer.from(JSON.stringify(req.body));
      const valid = this.githubWebhookService.verifySignature(
        secret,
        rawBody,
        signature ?? '',
      );
      if (!valid) throw new UnauthorizedException('Invalid webhook signature');
    }

    const payload = req.body;
    if (event === 'push') {
      await this.githubWebhookService.handlePushEvent(payload);
    } else if (event === 'pull_request') {
      await this.githubWebhookService.handlePullRequestEvent(payload);
    }

    return { received: true };
  }
}
