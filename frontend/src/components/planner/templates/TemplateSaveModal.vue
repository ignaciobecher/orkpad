<template>
  <div class="template-save-overlay" @mousedown.self="$emit('close')">
    <div class="template-save-modal">
      <div class="template-save-modal__header">
        <h4>Guardar día como plantilla</h4>
        <button @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="template-save-modal__body">
        <p class="template-save-modal__desc">
          Se capturarán todos los bloques de <strong>{{ currentDate }}</strong> como nueva plantilla.
        </p>

        <div class="template-save-modal__field">
          <label>Nombre de la plantilla *</label>
          <input
            v-model="name"
            class="template-save-modal__input"
            placeholder="Ej. Rutina productiva lunes"
            autofocus
            @keydown.enter="save"
          />
        </div>

        <div class="template-save-modal__field">
          <label>Descripción (opcional)</label>
          <input
            v-model="description"
            class="template-save-modal__input"
            placeholder="Ej. Mi rutina de alto rendimiento"
          />
        </div>
      </div>

      <div class="template-save-modal__footer">
        <button class="btn-cancel" @click="$emit('close')">Cancelar</button>
        <button class="btn-save" :disabled="!name.trim() || saving" @click="save">
          {{ saving ? 'Guardando...' : 'Guardar plantilla' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { usePlannerTemplatesStore } from '@/stores/planner-templates.store'

export default defineComponent({
  name: 'TemplateSaveModal',
  props: {
    currentDate: { type: String, required: true },
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const templatesStore = usePlannerTemplatesStore()
    const name = ref('')
    const description = ref('')
    const saving = ref(false)

    async function save() {
      if (!name.value.trim()) return
      saving.value = true
      try {
        await templatesStore.captureFromDay({
          date: props.currentDate,
          name: name.value.trim(),
          description: description.value.trim() || undefined,
        })
        emit('saved')
      } finally {
        saving.value = false
      }
    }

    return { name, description, saving, save }
  },
})
</script>

<style scoped>
.template-save-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  backdrop-filter: blur(4px);
  padding: 16px;
  box-sizing: border-box;
}

.template-save-modal {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  width: 420px;
  max-width: 100%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.4);
}

@media (max-width: 640px) {
  .template-save-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .template-save-modal {
    width: 100%;
    border-radius: 16px 16px 0 0;
    border-bottom: none;
  }

  .template-save-modal__footer {
    padding-bottom: max(14px, env(safe-area-inset-bottom));
    gap: 8px;
  }

  .btn-cancel,
  .btn-save {
    flex: 1;
  }
}

.template-save-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
}

.template-save-modal__header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-base);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: var(--font-mono);
}

.template-save-modal__header button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  padding: 2px;
}

.template-save-modal__header button:hover { color: var(--color-text-base); }

.template-save-modal__body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.template-save-modal__desc {
  font-size: 13px;
  color: var(--color-text-subtle);
  margin: 0;
  line-height: 1.5;
}

.template-save-modal__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.template-save-modal__field label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

.template-save-modal__input {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  padding: 8px 10px;
  color: var(--color-text-base);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
  border-radius: var(--radius);
}

.template-save-modal__input:focus { border-color: var(--color-primary); }

.template-save-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-surface-low);
}

.btn-cancel {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 8px 14px;
  cursor: pointer;
  font-size: 11px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: var(--color-text-muted);
  color: var(--color-text-base);
}

.btn-save {
  background: var(--color-primary);
  border: none;
  color: #fff;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 11px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: background 0.2s;
}

.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-save:hover:not(:disabled) { background: var(--color-primary-hover); }
</style>
