import apiClient from '../axios.config'
import type {
  ClearDemoDataResponse,
  OnboardingStatus,
  SeedDemoDataResponse,
  WelcomeContent,
} from './onboarding.types'

export const onboardingApi = {
  getStatus: () => apiClient.get<OnboardingStatus>('/auth/onboarding-status'),
  getWelcome: () => apiClient.get<WelcomeContent>('/onboarding/welcome'),
  seedDemoData: () => apiClient.post<SeedDemoDataResponse>('/onboarding/demo-data'),
  removeDemoData: () => apiClient.delete<ClearDemoDataResponse>('/onboarding/demo-data'),
}
