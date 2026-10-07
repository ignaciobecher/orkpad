import type { OnboardingSteps } from '@/api/onboarding/onboarding.types'

// Copy/CTA/routes for the checklist now come dynamically from GET /auth/onboarding-status
// (see onboardingStore.checklist). This file only keeps client-side-only concerns:
// the icon per step (the backend doesn't send one) and the celebration toast labels.

export const ONBOARDING_STEP_ICONS: Record<keyof OnboardingSteps, string> = {
  addedFirstClient: 'group',
  addedFirstProject: 'assignment',
  addedThreeTasks: 'task_alt',
  loggedFirstHours: 'timer',
  createdFirstQuote: 'request_quote',
  addedFirstRetainer: 'rebase_edit',
}

export const ONBOARDING_STEP_LABELS: Record<keyof OnboardingSteps, string> = {
  addedFirstClient: 'Primer cliente creado',
  addedFirstProject: 'Primer proyecto creado',
  addedThreeTasks: '3 tareas agregadas',
  loggedFirstHours: 'Primeras horas registradas',
  createdFirstQuote: 'Primer presupuesto creado',
  addedFirstRetainer: 'Primer recurrente registrado (cuota o gasto)',
}
