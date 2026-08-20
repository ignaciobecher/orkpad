import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { ContactFormDto } from './dto/contact-form.dto';

@ApiTags('Portfolio (Public)')
@Controller('public/portfolio')
export class PortfolioPublicController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get public portfolio page — no auth required' })
  getPortfolio(@Param('slug') slug: string) {
    return this.portfolioService.getPortfolio(slug);
  }

  @Post(':slug/contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Submit contact form — creates a lead Deal in the workspace pipeline',
  })
  contact(@Param('slug') slug: string, @Body() dto: ContactFormDto) {
    return this.portfolioService.submitContact(slug, dto);
  }
}
