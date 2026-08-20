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
import { MarketingPromptService } from './marketing-prompt.service';
import { CreateMarketingPromptDto } from './dto/create-marketing-prompt.dto';
import { UpdateMarketingPromptDto } from './dto/update-marketing-prompt.dto';
import { QueryMarketingPromptDto } from './dto/query-marketing-prompt.dto';

@ApiTags('Marketing - Prompts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('marketing/prompts')
export class MarketingPromptController {
  constructor(
    private readonly marketingPromptService: MarketingPromptService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar prompts reutilizables' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryMarketingPromptDto,
  ) {
    return this.marketingPromptService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un prompt por ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.marketingPromptService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un prompt reutilizable' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateMarketingPromptDto,
  ) {
    return this.marketingPromptService.create(workspaceId, user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un prompt' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMarketingPromptDto,
  ) {
    return this.marketingPromptService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar (soft-delete) un prompt' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.marketingPromptService.remove(workspaceId, id);
  }
}
