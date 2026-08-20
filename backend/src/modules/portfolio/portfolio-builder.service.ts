import { Injectable, NotFoundException } from '@nestjs/common';
import { PortfolioPageRepository } from './portfolio-page.repository';
import { SavePortfolioPageDto } from './dto/save-page.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { ProductsService } from '../products/products.service';
import { ProjectsService } from '../projects/projects.service';
import { TestimonialsService } from '../testimonials/testimonials.service';

@Injectable()
export class PortfolioBuilderService {
  constructor(
    private readonly pageRepo: PortfolioPageRepository,
    private readonly workspacesService: WorkspacesService,
    private readonly productsService: ProductsService,
    private readonly projectsService: ProjectsService,
    private readonly testimonialsService: TestimonialsService,
  ) {}

  async getPage(workspaceId: string) {
    const page = await this.pageRepo.findByWorkspace(workspaceId);
    if (!page) {
      return {
        theme: {
          primaryColor: '#2563EB',
          colorScheme: 'dark',
          fontFamily: 'inter',
        },
        seo: { title: '', description: '', ogImageUrl: '' },
        sections: [],
      };
    }
    return { theme: page.theme, seo: page.seo, sections: page.sections };
  }

  async savePage(workspaceId: string, dto: SavePortfolioPageDto) {
    const data: Record<string, any> = {};
    if (dto.theme !== undefined) data.theme = dto.theme;
    if (dto.seo !== undefined) data.seo = dto.seo;
    if (dto.sections !== undefined) data.sections = dto.sections;
    const page = await this.pageRepo.upsert(workspaceId, data);
    return { theme: page.theme, seo: page.seo, sections: page.sections };
  }

  async getPreview(workspaceId: string) {
    const workspace = await this.workspacesService.findById(workspaceId);
    const [services, featuredProjects, testimonials, page] = await Promise.all([
      this.productsService.findAllActiveForPortfolio(workspaceId),
      this.projectsService.findFeaturedForPortfolio(workspaceId),
      this.testimonialsService.findPublicForWorkspace(workspaceId),
      this.pageRepo.findByWorkspace(workspaceId),
    ]);

    return {
      profile: {
        name: workspace.name,
        slug: workspace.slug,
        bio: workspace.bio ?? null,
        headline: workspace.headline ?? null,
        avatarUrl: workspace.avatarUrl ?? null,
        bannerUrl: workspace.bannerUrl ?? null,
        socialLinks: workspace.socialLinks ?? {},
        skills: workspace.skills ?? [],
        availableForWork: workspace.availableForWork ?? false,
        availabilityNote: workspace.availabilityNote ?? null,
      },
      stats: workspace.portfolioStats ?? {},
      services,
      featuredProjects: featuredProjects.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description ?? null,
        status: p.status,
        startDate: p.startDate ?? null,
        endDate: p.endDate ?? null,
        coverImageUrl: p.coverImageUrl ?? null,
      })),
      testimonials,
      theme: page?.theme ?? null,
      seo: page?.seo ?? null,
      sections: page?.sections ?? null,
      poweredBy: 'Orkpad',
      isPreview: true,
    };
  }

  async duplicateSection(workspaceId: string, sectionId: string) {
    const page = await this.pageRepo.duplicateSection(workspaceId, sectionId);
    if (!page) throw new NotFoundException('Section or page not found');
    return { theme: page.theme, seo: page.seo, sections: page.sections };
  }
}
