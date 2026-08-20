import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { ProductsService } from '../products/products.service';
import { ProjectsService } from '../projects/projects.service';
import { TestimonialsService } from '../testimonials/testimonials.service';
import { DealsService } from '../pipeline/pipeline.service';
import { PortfolioPageRepository } from './portfolio-page.repository';
import { ContactFormDto } from './dto/contact-form.dto';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly productsService: ProductsService,
    private readonly projectsService: ProjectsService,
    private readonly testimonialsService: TestimonialsService,
    private readonly dealsService: DealsService,
    private readonly pageRepo: PortfolioPageRepository,
  ) {}

  async getPortfolio(slug: string) {
    const workspace = await this.workspacesService.findBySlug(slug);
    if (!workspace.publicProfile)
      throw new NotFoundException('Portfolio not found');

    const workspaceId = (workspace._id as any).toString();
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
    };
  }

  async submitContact(slug: string, dto: ContactFormDto) {
    const workspace = await this.workspacesService.findBySlug(slug);
    if (!workspace.publicProfile)
      throw new NotFoundException('Portfolio not found');
    const workspaceId = (workspace._id as any).toString();
    const notes = `Email: ${dto.email}\n${dto.subject ? `Asunto: ${dto.subject}\n` : ''}\n${dto.message}`;
    await this.dealsService.create(workspaceId, {
      title: `Contacto de ${dto.name}`,
      stage: 'lead',
      notes,
    });
    return { success: true };
  }
}
