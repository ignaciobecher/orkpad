<template>
  <div class="connections-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Integraciones</h1>
        <p class="page-subtitle">Conecta tus herramientas y servicios externos</p>
      </div>
    </header>

    <main class="page-content">
      <!-- GitHub (repo linking via OAuth) -->
      <div class="integration-card">
        <div class="integration-header">
          <div class="integration-icon github-icon">
            <span class="material-symbols-outlined">commit</span>
          </div>
          <div class="integration-info">
            <h2 class="integration-name">GitHub</h2>
            <p class="integration-description">Conectá tu cuenta de GitHub para vincular repositorios a tus proyectos y ver commits y pull requests.</p>
          </div>
          <div class="integration-status">
            <w-badge color="var(--color-primary)">Via OAuth</w-badge>
          </div>
        </div>

        <div class="integration-body">
          <div class="integration-actions">
            <w-button variant="primary" @click="connectGithub">
              <span class="material-symbols-outlined mr-1">add_link</span>
              Conectar GitHub
            </w-button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { baseURL } from '@/api/axios.config'
import WBadge from '@/components/ui/WBadge.vue'
import WButton from '@/components/ui/WButton.vue'

export default defineComponent({
  name: 'ConnectionsPage',
  components: { WBadge, WButton },
  methods: {
    connectGithub() {
      localStorage.setItem('github_auth_mode', 'link')
      window.location.href = `${baseURL}/auth/github`
    },
  },
})
</script>

<style scoped>
.connections-page {
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
  max-width: 720px;
}

.integration-card {
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
}

.integration-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.integration-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.github-icon {
  background-color: var(--color-bg-surface-high);
  color: var(--color-text-muted);
}

.github-icon .material-symbols-outlined {
  font-size: 22px;
}

.integration-info {
  flex: 1;
  min-width: 0;
}

.integration-name {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-base);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.integration-description {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
  line-height: 1.5;
}

.integration-status {
  flex-shrink: 0;
  padding-top: 2px;
}

.integration-body {
  padding: 20px 24px;
}

.integration-actions {
  display: flex;
  gap: 8px;
}

.mr-1 {
  margin-right: 4px;
}
</style>
