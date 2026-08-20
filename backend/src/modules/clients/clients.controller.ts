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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'List all clients in the workspace' })
  findAll(@WorkspaceId() workspaceId: string, @Query() query: QueryClientDto) {
    return this.clientsService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.clientsService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  create(@WorkspaceId() workspaceId: string, @Body() dto: CreateClientDto) {
    return this.clientsService.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a client' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.clientsService.remove(workspaceId, id);
  }
}
