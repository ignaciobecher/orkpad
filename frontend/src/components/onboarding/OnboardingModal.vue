<template>
  <Teleport to="body">
    <Transition name="onboarding-fade">
      <div v-if="onboardingStore.showWelcome" class="onboarding-overlay">
        <div class="onboarding-card">
          <div class="onboarding-header">
            <div class="brand">
              <w-logo :height="20" />
            </div>
            <button class="skip-btn" @click="handleSkip">
              {{ $t('onboarding.skip') }}
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="onboarding-body">
            <Transition :name="slideDirection" mode="out-in">
              <div :key="currentStep" class="step-content">
                <div class="step-icon-wrapper">
                  <span class="material-symbols-outlined step-icon">{{
                    currentStepData.icon
                  }}</span>
                </div>
                <span class="step-badge">{{ currentStepData.badge }}</span>
                <h2 class="step-title">{{ currentStepData.title }}</h2>
                <p class="step-description">{{ currentStepData.description }}</p>
              </div>
            </Transition>
          </div>

          <div class="progress-dots">
            <button
              v-for="(_, i) in steps"
              :key="i"
              :class="['dot', { 'dot--active': i === currentStep, 'dot--done': i < currentStep }]"
              @click="goToStep(i)"
            />
          </div>

          <div class="onboarding-footer">
            <button v-if="currentStep > 0" class="nav-btn nav-btn--back" @click="prev">
              <span class="material-symbols-outlined">arrow_back</span>
              {{ $t('onboarding.back') }}
            </button>
            <div v-else></div>

            <span class="step-counter">{{ currentStep + 1 }} / {{ steps.length }}</span>

            <button
              v-if="currentStep < steps.length - 1"
              class="nav-btn nav-btn--next"
              @click="next"
            >
              {{ $t('onboarding.next') }}
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
            <button v-else class="nav-btn nav-btn--done" @click="handleComplete">
              {{ $t('onboarding.start') }}
              <span class="material-symbols-outlined">rocket_launch</span>
            </button>
          </div>

          <div v-if="isLastStep" class="onboarding-demo-cta">
            <button class="demo-btn" :disabled="onboardingStore.demoLoading" @click="handleSeedDemoData">
              <span class="material-symbols-outlined">auto_awesome</span>
              Ver un ejemplo con datos de muestra
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import WLogo from '@/components/ui/WLogo.vue'

interface OnboardingStep {
  icon: string
  badge: string
  title: string
  description: string
}

export default defineComponent({
  name: 'OnboardingModal',
  components: { WLogo },
  setup() {
    const authStore = useAuthStore()
    const onboardingStore = useOnboardingStore()
    const currentStep = ref(0)
    const slideDirection = ref('slide-left')

    const steps = computed<OnboardingStep[]>(() => {
      const welcome = onboardingStore.welcome
      const intro: OnboardingStep = {
        icon: 'rocket_launch',
        badge: 'BIENVENIDO',
        title: '¡Bienvenido a Orkpad!',
        description:
          welcome?.headline ??
          'Tu sistema operativo para freelancers. Gestiona clientes, proyectos, tareas y finanzas en un solo lugar, con datos completamente aislados en tu workspace.',
      }

      const pillarSteps: OnboardingStep[] = (welcome?.pillars ?? []).map((pillar) => ({
        icon: pillar.icon,
        badge: pillar.title.toUpperCase(),
        title: pillar.title,
        description: pillar.description,
      }))

      const outro: OnboardingStep = {
        icon: 'check_circle',
        badge: 'LISTO',
        title: '¡Todo listo para comenzar!',
        description:
          'Ya conoces todas las secciones de Orkpad. Empieza creando tu primer cliente o explorando el dashboard para ver el estado de tu negocio.',
      }

      return [intro, ...pillarSteps, outro]
    })

    const currentStepData = computed(() => steps.value[currentStep.value])
    const isLastStep = computed(() => currentStep.value === steps.value.length - 1)

    // Reset to the first slide if the pillar list finishes loading after the modal is already open.
    watch(
      () => steps.value.length,
      () => {
        currentStep.value = 0
      },
    )

    function next() {
      if (currentStep.value < steps.value.length - 1) {
        slideDirection.value = 'slide-left'
        currentStep.value++
      }
    }

    function prev() {
      if (currentStep.value > 0) {
        slideDirection.value = 'slide-right'
        currentStep.value--
      }
    }

    function goToStep(i: number) {
      slideDirection.value = i > currentStep.value ? 'slide-left' : 'slide-right'
      currentStep.value = i
    }

    function handleComplete() {
      onboardingStore.hideWelcome()
    }

    function handleSkip() {
      onboardingStore.hideWelcome()
    }

    function handleSeedDemoData() {
      onboardingStore.seedDemoData()
    }

    return {
      authStore,
      onboardingStore,
      currentStep,
      slideDirection,
      steps,
      currentStepData,
      isLastStep,
      next,
      prev,
      goToStep,
      handleComplete,
      handleSkip,
      handleSeedDemoData,
    }
  },
})
</script>

<style scoped>
/* Overlay */
.onboarding-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
}

/* Card */
.onboarding-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
}

/* Header */
.onboarding-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-surface-low);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-text {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-base);
  letter-spacing: -0.05em;
}

.brand-square {
  width: 10px;
  height: 10px;
  background-color: var(--color-primary);
}

.skip-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.2s ease;
}

.skip-btn:hover {
  color: var(--color-text-base);
}

.skip-btn .material-symbols-outlined {
  font-size: 16px;
}

/* Body */
.onboarding-body {
  padding: 40px 40px 24px;
  min-height: 270px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.step-content {
  width: 100%;
  text-align: center;
}

.step-icon-wrapper {
  width: 64px;
  height: 64px;
  background-color: rgba(91, 78, 255, 0.08);
  border: 1px solid rgba(91, 78, 255, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.step-icon {
  font-size: 30px;
  color: var(--color-primary);
}

.step-badge {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 10px;
}

.step-title {
  font-family: var(--font-body);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-base);
  margin: 0 0 14px;
  line-height: 1.2;
}

.step-description {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.65;
  margin: 0;
  max-width: 400px;
  margin-inline: auto;
}

/* Progress dots */
.progress-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 16px 24px;
}

.dot {
  height: 6px;
  width: 6px;
  background-color: var(--color-border);
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  padding: 0;
  flex-shrink: 0;
}

.dot--active {
  width: 22px;
  background-color: var(--color-primary);
}

.dot--done {
  background-color: var(--color-primary);
  opacity: 0.35;
}

/* Footer */
.onboarding-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-surface-low);
}

.step-counter {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-disabled);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
}

/* Navigation buttons */
.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 36px;
}

.nav-btn--back {
  background: none;
  color: var(--color-text-muted);
}

.nav-btn--back:hover {
  color: var(--color-text-base);
}

.nav-btn--back .material-symbols-outlined,
.nav-btn--next .material-symbols-outlined,
.nav-btn--done .material-symbols-outlined {
  font-size: 16px;
}

.nav-btn--next,
.nav-btn--done {
  background-color: var(--color-primary);
  color: white;
}

.nav-btn--next:hover,
.nav-btn--done:hover {
  opacity: 0.88;
}

/* Demo data CTA */
.onboarding-demo-cta {
  display: flex;
  justify-content: center;
  padding: 0 24px 20px;
}

.demo-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px dashed var(--color-border);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  padding: 8px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:hover:not(:disabled) {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.demo-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.demo-btn .material-symbols-outlined {
  font-size: 16px;
}

/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.22s ease;
}

.slide-left-enter-from {
  transform: translateX(36px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-36px);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-36px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(36px);
  opacity: 0;
}

/* Modal fade */
.onboarding-fade-enter-active,
.onboarding-fade-leave-active {
  transition: opacity 0.3s ease;
}

.onboarding-fade-enter-from,
.onboarding-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .onboarding-body {
    padding: 32px 24px 20px;
    min-height: 240px;
  }

  .step-title {
    font-size: 18px;
  }
}
</style>
