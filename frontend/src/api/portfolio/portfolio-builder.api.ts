import apiClient from '../axios.config'
import type { PortfolioPage } from './portfolio-builder.types'
import type { PortfolioData } from './portfolio.types'

export const portfolioBuilderApi = {
  getPage: () => apiClient.get<PortfolioPage>('/portfolio/builder'),

  savePage: (page: Partial<PortfolioPage>) =>
    apiClient.put<PortfolioPage>('/portfolio/builder', page, {
      headers: { 'X-Hide-Global-Toast': 'true' },
    }),

  getPreview: () => apiClient.get<PortfolioData>('/portfolio/builder/preview'),

  duplicateSection: (sectionId: string) =>
    apiClient.post<PortfolioPage>(`/portfolio/builder/sections/${sectionId}/duplicate`),
}
