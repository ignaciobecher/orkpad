import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ProductsModule } from '../products/products.module';
import { ProjectsModule } from '../projects/projects.module';
import { TestimonialsModule } from '../testimonials/testimonials.module';
import { DealsModule } from '../pipeline/pipeline.module';
import { PortfolioPublicController } from './portfolio-public.controller';
import { PortfolioService } from './portfolio.service';
import { PortfolioBuilderController } from './portfolio-builder.controller';
import { PortfolioBuilderService } from './portfolio-builder.service';
import { PortfolioPageRepository } from './portfolio-page.repository';
import {
  PortfolioPage,
  PortfolioPageSchema,
} from './schemas/portfolio-page.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PortfolioPage.name, schema: PortfolioPageSchema },
    ]),
    WorkspacesModule,
    ProductsModule,
    ProjectsModule,
    TestimonialsModule,
    DealsModule,
  ],
  controllers: [PortfolioPublicController, PortfolioBuilderController],
  providers: [
    PortfolioService,
    PortfolioBuilderService,
    PortfolioPageRepository,
  ],
})
export class PortfolioModule {}
