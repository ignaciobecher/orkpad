<template>
  <auth-layout>
    <div class="verified-card">
      <div class="verified-header">
        <div class="brand">
          <w-logo :height="52" />
        </div>
      </div>

      <div v-if="!hasError" class="verified-body">
        <div class="icon-wrapper icon-wrapper--success">
          <span class="material-symbols-outlined">check_circle</span>
        </div>
        <span class="badge badge--success">VERIFICACIÓN COMPLETADA</span>
        <h2 class="title">¡Email verificado!</h2>
        <p class="description">
          Tu cuenta está activa. Ya podés ingresar a tu workspace y empezar a trabajar.
        </p>
        <router-link to="/login" class="cta-btn">
          Ir al inicio de sesión
          <span class="material-symbols-outlined">arrow_forward</span>
        </router-link>
      </div>

      <div v-else class="verified-body">
        <div class="icon-wrapper icon-wrapper--error">
          <span class="material-symbols-outlined">error</span>
        </div>
        <span class="badge badge--error">ENLACE INVÁLIDO</span>
        <h2 class="title">No pudimos verificar tu email</h2>
        <p class="description">
          El enlace es inválido o expiró. Podés solicitar uno nuevo desde la pantalla de inicio de
          sesión.
        </p>
        <router-link to="/login" class="cta-btn cta-btn--ghost">
          <span class="material-symbols-outlined">arrow_back</span>
          Volver al inicio de sesión
        </router-link>
      </div>
    </div>
  </auth-layout>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import WLogo from '@/components/ui/WLogo.vue'

export default defineComponent({
  name: 'EmailVerifiedPage',
  components: { AuthLayout, WLogo },
  setup() {
    const route = useRoute()
    const hasError = computed(() => !!route.query.error)
    return { hasError }
  },
})
</script>

<style scoped>
.verified-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 40px;
  min-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

@media (max-width: 640px) {
  .verified-card {
    min-width: unset;
    padding: 24px;
    border: none;
    background: transparent;
  }
}

.verified-header {
  display: flex;
  justify-content: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-text {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
  letter-spacing: -0.05em;
}

.brand-square {
  width: 16px;
  height: 16px;
  background-color: var(--color-primary);
}

.verified-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper--success {
  background-color: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.icon-wrapper--success .material-symbols-outlined {
  font-size: 28px;
  color: var(--color-success, #22c55e);
}

.icon-wrapper--error {
  background-color: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.icon-wrapper--error .material-symbols-outlined {
  font-size: 28px;
  color: var(--color-error);
}

.badge {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.badge--success {
  color: var(--color-success, #22c55e);
}
.badge--error {
  color: var(--color-error);
}

.title {
  font-family: var(--font-body);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-base);
  margin: 0;
}

.description {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.65;
  margin: 0;
  max-width: 300px;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 10px 24px;
  background-color: var(--color-primary);
  color: white;
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  transition: opacity 0.2s;
  height: 40px;
}

.cta-btn:hover {
  opacity: 0.88;
}

.cta-btn .material-symbols-outlined {
  font-size: 16px;
}

.cta-btn--ghost {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.cta-btn--ghost:hover {
  opacity: 1;
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
