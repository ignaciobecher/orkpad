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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

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

  @Post(':id/generate-invoices')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Generate installment invoices (cuotas) from the project billing plan',
  })
  generateInvoices(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.projectsService.generateInvoices(workspaceId, id);
  }
}
