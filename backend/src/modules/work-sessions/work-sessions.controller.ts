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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WorkSessionsService } from './work-sessions.service';
import { CreateWorkSessionDto } from './dto/create-work-session.dto';
import { UpdateWorkSessionDto } from './dto/update-work-session.dto';
import { QueryWorkSessionDto } from './dto/query-work-session.dto';

@ApiTags('Work Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('work-sessions')
export class WorkSessionsController {
  constructor(private readonly service: WorkSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar jornadas de trabajo' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryWorkSessionDto,
  ) {
    return this.service.findAll(workspaceId, query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener jornada activa del usuario actual' })
  getActive(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.service.findActive(workspaceId, user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Iniciar una jornada de trabajo' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateWorkSessionDto,
  ) {
    return this.service.start(workspaceId, user.userId, dto);
  }

  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalizar una jornada de trabajo' })
  end(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.service.end(workspaceId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar notas de una jornada' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkSessionDto,
  ) {
    return this.service.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una jornada' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.service.remove(workspaceId, id);
  }
}
