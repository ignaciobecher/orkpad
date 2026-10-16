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
import { ProjectSharesService } from './project-shares.service';
import {
  CreateProjectShareDto,
  UpdateProjectShareDto,
} from './dto/share.dto';

@ApiTags('ProjectShares')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/shares')
export class ProjectSharesController {
  constructor(private readonly sharesService: ProjectSharesService) {}

  @Get()
  @ApiOperation({ summary: 'List client accesses of a project' })
  list(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.sharesService.list(workspaceId, projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a client access (username + password + link)' })
  create(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectShareDto,
  ) {
    return this.sharesService.create(workspaceId, projectId, dto);
  }

  @Patch(':shareId')
  @ApiOperation({ summary: 'Update a client access' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('shareId') shareId: string,
    @Body() dto: UpdateProjectShareDto,
  ) {
    return this.sharesService.update(workspaceId, projectId, shareId, dto);
  }

  @Post(':shareId/regenerate-token')
  @ApiOperation({ summary: 'Regenerate the private link token' })
  regenerateToken(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('shareId') shareId: string,
  ) {
    return this.sharesService.regenerateToken(workspaceId, projectId, shareId);
  }

  @Delete(':shareId')
  @ApiOperation({ summary: 'Revoke a client access' })
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('shareId') shareId: string,
  ) {
    return this.sharesService.remove(workspaceId, projectId, shareId);
  }
}
