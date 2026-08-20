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
import { AdminGuard } from '../../common/guards/admin.guard';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { QueryResourceDto } from './dto/query-resource.dto';
import { CreateResourceCategoryDto } from './dto/create-resource-category.dto';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  // ── Public endpoints ─────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List published resources' })
  findAll(@Query() query: QueryResourceDto) {
    return this.resourcesService.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all resource categories' })
  findAllCategories() {
    return this.resourcesService.findAllCategories();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a published resource by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.resourcesService.findBySlug(slug);
  }

  // ── Admin endpoints ──────────────────────────────────────────────────────────

  @Get('admin/all')
  @ApiOperation({ summary: '[Admin] List all resources including drafts' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin(@Query() query: QueryResourceDto) {
    return this.resourcesService.findAllAdmin(query);
  }

  @Post()
  @ApiOperation({ summary: '[Admin] Create a new resource' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateResourceDto) {
    return this.resourcesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update a resource' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    return this.resourcesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '[Admin] Soft-delete a resource' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }

  @Post('categories')
  @ApiOperation({ summary: '[Admin] Create a resource category' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  createCategory(@Body() dto: CreateResourceCategoryDto) {
    return this.resourcesService.createCategory(dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: '[Admin] Soft-delete a resource category' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCategory(@Param('id') id: string) {
    return this.resourcesService.removeCategory(id);
  }
}
