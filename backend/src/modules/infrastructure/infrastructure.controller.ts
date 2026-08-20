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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { InfrastructureResourcesService } from './infrastructure.service';
import { CreateInfrastructureResourceDto } from './dto/create-infrastructure.dto';
import { UpdateInfrastructureResourceDto } from './dto/update-infrastructure.dto';
import { QueryInfrastructureResourceDto } from './dto/query-infrastructure.dto';

@ApiTags('InfrastructureResources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('infrastructure')
export class InfrastructureResourcesController {
  constructor(private readonly service: InfrastructureResourcesService) {}

  @Get()
  @ApiOperation({ summary: 'List all infrastructure' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryInfrastructureResourceDto,
  ) {
    return this.service.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.service.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new' })
  create(
    @WorkspaceId() workspaceId: string,
    @Body() dto: CreateInfrastructureResourceDto,
  ) {
    return this.service.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInfrastructureResourceDto,
  ) {
    return this.service.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.service.remove(workspaceId, id);
  }
}
