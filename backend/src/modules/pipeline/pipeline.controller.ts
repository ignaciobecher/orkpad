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
import { DealsService } from './pipeline.service';
import { CreateDealDto } from './dto/create-pipeline.dto';
import { UpdateDealDto } from './dto/update-pipeline.dto';
import { QueryDealDto } from './dto/query-pipeline.dto';

@ApiTags('Deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pipeline')
export class DealsController {
  constructor(private readonly service: DealsService) {}

  @Get()
  @ApiOperation({ summary: 'List all pipeline' })
  findAll(@WorkspaceId() workspaceId: string, @Query() query: QueryDealDto) {
    return this.service.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.service.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new' })
  create(@WorkspaceId() workspaceId: string, @Body() dto: CreateDealDto) {
    return this.service.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.service.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.service.remove(workspaceId, id);
  }
}
