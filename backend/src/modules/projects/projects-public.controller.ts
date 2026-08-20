import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { ProjectLinkCredentialService } from './project-link-credential.service';
import { AuthLinkDto } from './dto/auth-link.dto';
import { ProjectLinkAccessGuard } from '../../common/guards/project-link-access.guard';

@ApiTags('Projects (Public)')
@Controller('public/projects')
export class ProjectsPublicController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectLinkCredentialService: ProjectLinkCredentialService,
  ) {}

  @Post(':token/auth')
  @ApiOperation({
    summary:
      'Authenticate against a private project link — returns a short-lived access token',
  })
  authLink(@Param('token') token: string, @Body() dto: AuthLinkDto) {
    return this.projectLinkCredentialService.authenticateLink(token, dto);
  }

  @Get(':token')
  @UseGuards(ProjectLinkAccessGuard)
  @ApiOperation({
    summary:
      'Get public project view by shareable token — no auth required for public links',
  })
  getPublicView(@Param('token') token: string) {
    return this.projectsService.getPublicView(token);
  }

  @Post(':token/tasks')
  @UseGuards(ProjectLinkAccessGuard)
  @ApiOperation({
    summary: 'Create a task for the project via public/private token',
  })
  createPublicTask(
    @Param('token') token: string,
    @Body() dto: { title: string; description?: string },
  ) {
    return this.projectsService.createPublicTask(token, dto);
  }
}
