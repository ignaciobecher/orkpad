import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { WorkspacesService } from './workspaces.service';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current workspace' })
  getMyWorkspace(@WorkspaceId() workspaceId: string) {
    return this.workspacesService.findById(workspaceId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the current workspace' })
  updateMyWorkspace(
    @WorkspaceId() workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(workspaceId, dto);
  }
}
