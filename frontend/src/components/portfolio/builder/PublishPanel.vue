<template>
  <div class="pp">
    <!-- Visibility toggle -->
    <div class="pp__section">
      <div class="pp__toggle-row">
        <div class="pp__toggle-info">
          <p class="pp__toggle-label">Portfolio público</p>
          <p class="pp__toggle-desc">
            {{ workspace.publicProfile
              ? 'Tu portfolio es visible para cualquier visitante.'
              : 'Activalo para compartir tu portfolio con el mundo.' }}
          </p>
        </div>
        <label class="pp__toggle" :class="{ 'pp__toggle--on': workspace.publicProfile }">
          <input type="checkbox" :checked="workspace.publicProfile" :disabled="saving" @change="togglePublic(($event.target as HTMLInputElement).checked)" />
          <span class="pp__toggle-slider"></span>
        </label>
      </div>
      <div v-if="saving" class="pp__saving-indicator">
        <span class="mdi mdi-loading mdi-spin"></span> Guardando...
      </div>
    </div>

    <!-- Public URL -->
    <div class="pp__section">
      <p class="pp__url-label">Link de tu portfolio</p>
      <div v-if="workspace.slug" class="pp__url-row">
        <input class="pp__url-input" :value="portfolioUrl" readonly />
        <button class="pp__icon-btn" title="Copiar link" @click="copyLink">
          <span class="mdi mdi-content-copy"></span>
        </button>
        <button
          v-if="workspace.publicProfile"
          class="pp__icon-btn"
          title="Abrir portfolio"
          @click="openPublic"
        >
          <span class="mdi mdi-open-in-new"></span>
        </button>
      </div>
      <p v-else class="pp__url-placeholder">El URL se genera automáticamente al crear el workspace.</p>
    </div>

    <!-- Status -->
    <div v-if="workspace.publicProfile" class="pp__status pp__status--active">
      <span class="mdi mdi-check-circle-outline pp__status-icon"></span>
      <span>Portfolio activo y visible</span>
    </div>
    <div v-else class="pp__status pp__status--inactive">
      <span class="mdi mdi-eye-off-outline pp__status-icon"></span>
      <span>Portfolio desactivado — nadie puede verlo todavía</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { workspacesApi } from '@/api/workspaces/workspaces.api'
import { useToast } from '@/composables/useToast'
import type { Workspace } from '@/api/workspaces/workspaces.types'

const props = defineProps<{ workspace: Workspace }>()
const emit = defineEmits<{ updated: [workspace: Workspace] }>()

const saving = ref(false)

const portfolioUrl = computed(() => {
  return `${window.location.origin}/portfolio/${props.workspace.slug}`
})

async function togglePublic(value: boolean) {
  saving.value = true
  try {
    const { data } = await workspacesApi.updateMe({ publicProfile: value })
    useToast().success(value ? 'Portfolio público activado' : 'Portfolio desactivado')
    emit('updated', data)
  } catch {
    useToast().error('Error al cambiar la visibilidad')
  } finally {
    saving.value = false
  }
}

function copyLink() {
  if (!props.workspace.slug) return
  navigator.clipboard.writeText(portfolioUrl.value)
  useToast().success('Link copiado')
}

function openPublic() {
  window.open(portfolioUrl.value, '_blank')
}
</script>

<style scoped>
.pp { padding: 12px; display: flex; flex-direction: column; gap: 16px; }
.pp__section { display: flex; flex-direction: column; gap: 8px; }
.pp__toggle-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.pp__toggle-info { flex: 1; }
.pp__toggle-label { font-size: 13px; font-weight: 600; color: var(--color-text-base); margin: 0; }
.pp__toggle-desc { font-size: 12px; color: var(--color-text-muted); margin: 3px 0 0; }
.pp__toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; margin-top: 2px; }
.pp__toggle input { opacity: 0; width: 0; height: 0; }
.pp__toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--color-border); border-radius: 24px; transition: 0.2s; }
.pp__toggle-slider:before { position: absolute; content: ''; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
.pp__toggle--on .pp__toggle-slider { background-color: var(--color-primary); }
.pp__toggle--on .pp__toggle-slider:before { transform: translateX(20px); }
.pp__toggle input:disabled + .pp__toggle-slider { opacity: 0.5; cursor: not-allowed; }
.pp__saving-indicator { font-size: 12px; color: var(--color-text-muted); display: flex; align-items: center; gap: 6px; }
.pp__url-label { font-size: 11px; font-weight: 500; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
.pp__url-row { display: flex; gap: 4px; align-items: center; }
.pp__url-input { flex: 1; padding: 7px 10px; border: 1px solid var(--color-border); background: var(--color-bg-surface-low); color: var(--color-text-muted); font-size: 12px; font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pp__icon-btn { padding: 7px 9px; border: 1px solid var(--color-border); background: var(--color-bg-surface-low); color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; font-size: 16px; flex-shrink: 0; }
.pp__icon-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.pp__url-placeholder { font-size: 12px; color: var(--color-text-muted); margin: 0; }
.pp__status { display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 10px 12px; border: 1px solid; }
.pp__status--active { color: var(--color-success, #34d399); border-color: rgba(52, 211, 153, 0.3); background: rgba(52, 211, 153, 0.05); }
.pp__status--inactive { color: var(--color-text-muted); border-color: var(--color-border); background: var(--color-bg-surface-low); }
.pp__status-icon { font-size: 16px; flex-shrink: 0; }
</style>
