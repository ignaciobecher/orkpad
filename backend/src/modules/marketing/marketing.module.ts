import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketingIdea, MarketingIdeaSchema } from './marketing-idea.schema';
import {
  MarketingPrompt,
  MarketingPromptSchema,
} from './marketing-prompt.schema';
import { MarketingPost, MarketingPostSchema } from './marketing-post.schema';
import { MarketingIdeaController } from './marketing-idea.controller';
import { MarketingPromptController } from './marketing-prompt.controller';
import { MarketingPostController } from './marketing-post.controller';
import { MarketingIdeaService } from './marketing-idea.service';
import { MarketingPromptService } from './marketing-prompt.service';
import { MarketingPostService } from './marketing-post.service';
import { MarketingDashboardService } from './marketing-dashboard.service';
import { MarketingIdeaRepository } from './marketing-idea.repository';
import { MarketingPromptRepository } from './marketing-prompt.repository';
import { MarketingPostRepository } from './marketing-post.repository';
import { ExcelImportService } from './excel-import.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketingIdea.name, schema: MarketingIdeaSchema },
      { name: MarketingPrompt.name, schema: MarketingPromptSchema },
      { name: MarketingPost.name, schema: MarketingPostSchema },
    ]),
  ],
  controllers: [
    MarketingIdeaController,
    MarketingPromptController,
    MarketingPostController,
  ],
  providers: [
    MarketingIdeaService,
    MarketingIdeaRepository,
    MarketingPromptService,
    MarketingPromptRepository,
    MarketingPostService,
    MarketingPostRepository,
    MarketingDashboardService,
    ExcelImportService,
  ],
  exports: [MarketingIdeaService, MarketingPromptService, MarketingPostService],
})
export class MarketingModule {}
