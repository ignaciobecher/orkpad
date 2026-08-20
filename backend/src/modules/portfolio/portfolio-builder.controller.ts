import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { PortfolioBuilderService } from './portfolio-builder.service';
import { SavePortfolioPageDto } from './dto/save-page.dto';

@ApiTags('Portfolio Builder')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('portfolio/builder')
export class PortfolioBuilderController {
  constructor(private readonly builderService: PortfolioBuilderService) {}

  @Get('preview')
  @ApiOperation({
    summary: 'Preview del portfolio sin requerir publicación (requiere auth)',
  })
  getPreview(@WorkspaceId() workspaceId: string) {
    return this.builderService.getPreview(workspaceId);
  }

  @Get()
  @ApiOperation({ summary: 'Get portfolio page structure for the builder' })
  getPage(@WorkspaceId() workspaceId: string) {
    return this.builderService.getPage(workspaceId);
  }

  @Put()
  @ApiOperation({ summary: 'Save full portfolio page (sections, theme, SEO)' })
  savePage(
    @WorkspaceId() workspaceId: string,
    @Body() dto: SavePortfolioPageDto,
  ) {
    return this.builderService.savePage(workspaceId, dto);
  }

  @Post('sections/:sectionId/duplicate')
  @ApiOperation({ summary: 'Duplicar una sección (desplaza las siguientes)' })
  duplicateSection(
    @WorkspaceId() workspaceId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.builderService.duplicateSection(workspaceId, sectionId);
  }
}
