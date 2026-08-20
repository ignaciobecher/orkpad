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
import { SocialIdentityService } from './social-identity.service';
import { CreateSocialAccountDto } from './dto/create-social-account.dto';
import { UpdateSocialAccountDto } from './dto/update-social-account.dto';
import { QuerySocialAccountDto } from './dto/query-social-account.dto';
import { AddWeeklyMetricDto } from './dto/add-weekly-metric.dto';
import { AddContentPillarDto } from './dto/add-content-pillar.dto';
import { AddMessageTemplateDto } from './dto/add-message-template.dto';
import { DuplicateSocialAccountDto } from './dto/duplicate-social-account.dto';

@ApiTags('Social Identity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('social-identity')
export class SocialIdentityController {
  constructor(private readonly socialIdentityService: SocialIdentityService) {}

  @Get()
  @ApiOperation({ summary: 'Listar cuentas de redes sociales' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QuerySocialAccountDto,
  ) {
    return this.socialIdentityService.findAll(workspaceId, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumen de todas las cuentas para el dashboard' })
  getSummary(@WorkspaceId() workspaceId: string) {
    return this.socialIdentityService.getSummary(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cuenta por ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.socialIdentityService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva cuenta de red social' })
  create(
    @WorkspaceId() workspaceId: string,
    @Body() dto: CreateSocialAccountDto,
  ) {
    return this.socialIdentityService.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una cuenta' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSocialAccountDto,
  ) {
    return this.socialIdentityService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archivar una cuenta' })
  archive(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.socialIdentityService.archive(workspaceId, id);
  }

  @Post(':id/metrics')
  @ApiOperation({ summary: 'Registrar métricas semanales de una cuenta' })
  addMetric(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: AddWeeklyMetricDto,
  ) {
    return this.socialIdentityService.addWeeklyMetric(workspaceId, id, dto);
  }

  @Post(':id/pillars')
  @ApiOperation({ summary: 'Agregar un pilar de contenido' })
  addPillar(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: AddContentPillarDto,
  ) {
    return this.socialIdentityService.addContentPillar(workspaceId, id, dto);
  }

  @Delete(':id/pillars/:pillarId')
  @ApiOperation({ summary: 'Eliminar un pilar de contenido' })
  removePillar(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Param('pillarId') pillarId: string,
  ) {
    return this.socialIdentityService.removeContentPillar(
      workspaceId,
      id,
      pillarId,
    );
  }

  @Post(':id/templates')
  @ApiOperation({ summary: 'Agregar un template de mensaje' })
  addTemplate(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: AddMessageTemplateDto,
  ) {
    return this.socialIdentityService.addMessageTemplate(workspaceId, id, dto);
  }

  @Delete(':id/templates/:templateId')
  @ApiOperation({ summary: 'Eliminar un template de mensaje' })
  removeTemplate(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Param('templateId') templateId: string,
  ) {
    return this.socialIdentityService.removeMessageTemplate(
      workspaceId,
      id,
      templateId,
    );
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicar una cuenta para otra plataforma' })
  duplicate(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: DuplicateSocialAccountDto,
  ) {
    return this.socialIdentityService.duplicate(
      workspaceId,
      id,
      dto.platform,
      dto.accountName,
    );
  }
}
