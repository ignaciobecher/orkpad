<template>
  <div class="modal-overlay" @click.self="handleClose">
    <div class="modal">
      <div class="modal-header">
        <div>
          <p class="modal-label">COMUNICADOS</p>
          <h2 class="modal-title">Nuevo Anuncio</h2>
        </div>
        <button class="modal-close" @click="handleClose">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="modal-body">
        <template v-if="!confirming && !result">
          <div class="section">
            <p class="section-label">TÍTULO</p>
            <input
              v-model="form.title"
              type="text"
              maxlength="120"
              placeholder="Nueva funcionalidad disponible"
              class="text-input"
            />
          </div>

          <div class="section">
            <p class="section-label">MENSAJE</p>
            <textarea
              v-model="form.message"
              maxlength="500"
              rows="4"
              placeholder="Ya podés probar la nueva sección de Reportes."
              class="textarea-input"
            ></textarea>
          </div>

          <div class="section">
            <p class="section-label">TIPO</p>
            <div class="type-list">
              <button
                v-for="opt in typeOptions"
                :key="opt.value"
                class="type-pill"
                :class="[`type-pill--${opt.value}`, { 'type-pill--selected': form.type === opt.value }]"
                @click="form.type = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="section">
            <p class="section-label">LINK (OPCIONAL)</p>
            <input
              v-model="form.link"
              type="text"
              placeholder="/app/reports"
              class="text-input"
            />
          </div>
        </template>

        <div v-else-if="confirming" class="confirm-box">
          <span class="material-symbols-outlined confirm-icon">warning</span>
          <p class="confirm-text">
            ¿Confirmás el envío a todos los usuarios ({{ totalUsers }})? Esta acción no se puede deshacer.
          </p>
        </div>

        <div v-else-if="result" class="send-result">
          <span class="material-symbols-outlined result-icon">check_circle</span>
          {{ result.sent }} anuncios enviados de {{ result.total }} usuarios
        </div>
      </div>

      <div class="modal-footer">
        <div class="modal-actions">
          <template v-if="result">
            <button class="cancel-btn" @click="handleClose">Cerrar</button>
          </template>
          <template v-else-if="confirming">
            <button class="cancel-btn" :disabled="sending" @click="confirming = false">Volver</button>
            <button class="send-btn" :disabled="sending" @click="sendAnnouncement">
              <span v-if="sending" class="material-symbols-outlined spinning btn-icon">sync</span>
              <span v-else class="material-symbols-outlined btn-icon">send</span>
              {{ sending ? 'Enviando...' : 'Confirmar envío' }}
            </button>
          </template>
          <template v-else>
            <button class="cancel-btn" @click="handleClose">Cancelar</button>
            <button class="send-btn" :disabled="!canSubmit" @click="confirming = true">
              <span class="material-symbols-outlined btn-icon">campaign</span>
              {{ `Enviar a todos (${totalUsers})` }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { notificationsApi } from '@/api/notifications/notifications.api'
import type { BroadcastNotificationResponse } from '@/api/notifications/notifications.types'

export default defineComponent({
  name: 'AnnouncementComposerModal',
  props: {
    totalUsers: {
      type: Number,
      default: 0,
    },
  },
  emits: ['close', 'sent'],
  setup(props, { emit }) {
    const typeOptions = [
      { value: 'info', label: 'Info' },
      { value: 'success', label: 'Success' },
      { value: 'warning', label: 'Warning' },
      { value: 'error', label: 'Error' },
    ] as const

    const form = ref({
      title: '',
      message: '',
      type: 'info' as 'info' | 'warning' | 'success' | 'error',
      link: '',
    })

    const confirming = ref(false)
    const sending = ref(false)
    const result = ref<BroadcastNotificationResponse | null>(null)

    const canSubmit = computed(() => form.value.title.trim().length > 0 && form.value.message.trim().length > 0)

    const handleClose = () => {
      emit('close')
    }

    const sendAnnouncement = async () => {
      sending.value = true
      try {
        const { data } = await notificationsApi.broadcast({
          title: form.value.title.trim(),
          message: form.value.message.trim(),
          type: form.value.type,
          link: form.value.link.trim() || undefined,
        })
        result.value = data
        confirming.value = false
        emit('sent', data)
      } catch (err) {
        console.error('Error sending announcement:', err)
      } finally {
        sending.value = false
      }
    }

    return {
      typeOptions,
      form,
      confirming,
      sending,
      result,
      canSubmit,
      handleClose,
      sendAnnouncement,
    }
  },
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 28px 28px 0;
}

.modal-label {
  margin: 0 0 4px 0;
  font-size: 10px;
  color: var(--color-primary);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-base);
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.modal-close:hover {
  color: var(--color-text-base);
}

.modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-label {
  margin: 0 0 8px 0;
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.text-input,
.textarea-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-base);
  font-size: 14px;
  font-family: var(--font-body);
  box-sizing: border-box;
}

.textarea-input {
  resize: vertical;
}

.text-input:focus,
.textarea-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.type-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-pill {
  padding: 6px 14px;
  font-size: 12px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.type-pill--selected.type-pill--info {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(91, 78, 255, 0.1);
}

.type-pill--selected.type-pill--success {
  border-color: #10b981;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.type-pill--selected.type-pill--warning {
  border-color: #f59e0b;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.type-pill--selected.type-pill--error {
  border-color: var(--color-error, #ef4444);
  color: var(--color-error, #ef4444);
  background: rgba(239, 68, 68, 0.1);
}

.confirm-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 4px;
}

.confirm-icon {
  color: #f59e0b;
  font-size: 22px;
}

.confirm-text {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-base);
  line-height: 1.5;
}

.modal-footer {
  padding: 16px 28px 24px;
  border-top: 1px solid var(--color-border);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 9px 18px;
  font-size: 13px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.cancel-btn:hover:not(:disabled) {
  border-color: var(--color-text-muted);
  color: var(--color-text-base);
}

.send-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  font-size: 13px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn-icon {
  font-size: 16px;
}

.spinning {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.send-result {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-success, #10b981);
  font-weight: 500;
}

.result-icon {
  font-size: 20px;
}
</style>
