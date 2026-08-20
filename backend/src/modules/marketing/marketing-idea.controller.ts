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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MarketingIdeaService } from './marketing-idea.service';
import { CreateMarketingIdeaDto } from './dto/create-marketing-idea.dto';
import { UpdateMarketingIdeaDto } from './dto/update-marketing-idea.dto';
import { QueryMarketingIdeaDto } from './dto/query-marketing-idea.dto';

@ApiTags('Marketing - Ideas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('marketing/ideas')
export class MarketingIdeaController {
  constructor(private readonly marketingIdeaService: MarketingIdeaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar ideas de contenido' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryMarketingIdeaDto,
  ) {
    return this.marketingIdeaService.findAll(workspaceId, query);
  }

  @Get('kanban')
  @ApiOperation({
    summary: 'Obtener ideas agrupadas por estado para el tablero Kanban',
  })
  kanban(@WorkspaceId() workspaceId: string) {
    return this.marketingIdeaService.kanban(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una idea por ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.marketingIdeaService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una idea de contenido' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateMarketingIdeaDto,
  ) {
    return this.marketingIdeaService.create(workspaceId, user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una idea' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMarketingIdeaDto,
  ) {
    return this.marketingIdeaService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar (soft-delete) una idea' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.marketingIdeaService.remove(workspaceId, id);
  }
}
