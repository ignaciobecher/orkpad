<template>
  <div class="goals-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Objetivos</h1>
        <p class="page-subtitle">Metas y hábitos para hacer crecer tu agencia</p>
      </div>
    </header>

    <main class="page-content">
      <goals-tab />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GoalsTab from '@/components/goals/GoalsTab.vue'

export default defineComponent({
  name: 'GoalsPage',
  components: { GoalsTab },
})
</script>

<style scoped>
.goals-page {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.page-title {
  font-family: var(--font-body);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-base);
}

.page-subtitle {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 960px;
}
</style>
