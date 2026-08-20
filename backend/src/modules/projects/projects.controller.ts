import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { ProjectsService } from './projects.service';
import { ProjectLinkCredentialService } from './project-link-credential.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { SetLinkCredentialDto } from './dto/set-link-credential.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectLinkCredentialService: ProjectLinkCredentialService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all projects in the workspace' })
  findAll(@WorkspaceId() workspaceId: string, @Query() query: QueryProjectDto) {
    return this.projectsService.findAll(workspaceId, query);
  }

  @Get(':id/overview')
  @ApiOperation({
    summary: 'Get full project overview — tasks, invoices and aggregated stats',
  })
  getOverview(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.projectsService.getOverview(workspaceId, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.projectsService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(@WorkspaceId() workspaceId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a project' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.projectsService.remove(workspaceId, id);
  }

  @Post(':id/public-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate a secure public shareable link for the project',
  })
  generatePublicLink(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.projectsService.generatePublicLink(workspaceId, id);
  }

  @Delete(':id/public-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke the public link — clients lose access immediately',
  })
  revokePublicLink(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.projectsService.revokePublicLink(workspaceId, id);
  }

  @Get(':id/link-status')
  @ApiOperation({
    summary: 'Get current public/private link configuration for the project',
  })
  getLinkStatus(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.projectLinkCredentialService.getLinkStatus(workspaceId, id);
  }

  @Put(':id/link-credential')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Set or replace private link credentials — switches link to private mode',
  })
  setLinkCredential(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: SetLinkCredentialDto,
  ) {
    return this.projectLinkCredentialService.setCredential(
      workspaceId,
      id,
      dto,
    );
  }

  @Delete(':id/link-credential')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove private link credentials — reverts link to public mode',
  })
  removeLinkCredential(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.projectLinkCredentialService.removeCredential(workspaceId, id);
  }

  @Post(':id/link-credential/rotate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Rotate private link password — returns new plaintext password once',
  })
  rotateLinkCredential(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.projectLinkCredentialService.rotateCredential(workspaceId, id);
  }
}
