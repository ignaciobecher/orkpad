import apiClient from '../axios.config'
import type { PortfolioData, ContactFormDto } from './portfolio.types'

export const portfolioApi = {
  getPortfolio: (slug: string) =>
    apiClient.get<PortfolioData>(`/public/portfolio/${slug}`),

  submitContact: (slug: string, dto: ContactFormDto) =>
    apiClient.post<{ success: boolean }>(`/public/portfolio/${slug}/contact`, dto),
}
