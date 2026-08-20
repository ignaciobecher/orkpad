<template>
  <w-drawer v-model="show" :title="title" width="900px">
    <div class="import-modal">
      <div v-if="step === 'upload'" class="upload-step">
        <p class="step-description">
          Cargá un Excel con tus ideas de contenido. Las columnas requeridas son:
          <strong>dia, red, formato, contenido/titulo, descripcion</strong>.
        </p>
        <p class="step-description step-description--hint">
          Tamaño máximo del archivo: <strong>10MB</strong>. Si tenés muchas filas, importá en lotes más chicos para evitar errores.
        </p>

        <div class="upload-actions">
          <w-button variant="secondary" @click="downloadTemplate">
            <span class="material-symbols-outlined mr-2">download</span>
            Descargar plantilla
          </w-button>
        </div>

        <div
          class="dropzone"
          :class="{ 'dropzone--active': isDragging }"
          @click="triggerFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <span class="material-symbols-outlined dropzone__icon">cloud_upload</span>
          <p class="dropzone__text">Arrastrá tu archivo Excel aquí o hacé clic para seleccionarlo</p>
          <p class="dropzone__hint">Formatos admitidos: .xlsx, .xls</p>
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls"
            class="hidden-file-input"
            @change="onFileSelected"
          />
        </div>

        <div v-if="parsing" class="state-message">
          <span class="material-symbols-outlined spinning">sync</span>
          Procesando archivo...
        </div>
      </div>

      <div v-else-if="step === 'preview'" class="preview-step">
        <div class="preview-summary">
          <span class="summary-item">
            <strong>{{ previewRows.length }}</strong> filas
          </span>
          <span class="summary-item summary-item--valid">
            <span class="dot dot--valid"></span>
            {{ validCount }} válidas
          </span>
          <span v-if="invalidCount > 0" class="summary-item summary-item--invalid">
            <span class="dot dot--invalid"></span>
            {{ invalidCount }} con errores
          </span>
          <w-button variant="ghost" @click="resetToUpload">
            <span class="material-symbols-outlined mr-2">upload_file</span>
            Cargar otro archivo
          </w-button>
        </div>

        <div class="preview-table-wrap">
          <table class="preview-table">
            <thead>
              <tr>
                <th style="width: 40px">#</th>
                <th style="width: 120px">Día</th>
                <th style="width: 110px">Red</th>
                <th style="width: 110px">Formato</th>
                <th>Contenido / Título</th>
                <th>Descripción</th>
                <th style="width: 80px">Estado</th>
                <th style="width: 70px"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in previewRows"
                :key="idx"
                :class="{ 'row--invalid': !row.isValid }"
              >
                <td class="cell-row-index">{{ idx + 1 }}</td>
                <td>
                  <input v-model="row.dia" type="date" class="cell-input" @change="revalidateRow(row)" />
                </td>
                <td>
                  <select v-model="row.red" class="cell-input" @change="revalidateRow(row)">
                    <option v-for="opt in NETWORK_OPTIONS" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </td>
                <td>
                  <select v-model="row.formato" class="cell-input" @change="revalidateRow(row)">
                    <option v-for="opt in FORMAT_OPTIONS" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </td>
                <td>
                  <input v-model="row.contenidoTitulo" class="cell-input" @input="revalidateRow(row)" />
                </td>
                <td>
                  <textarea v-model="row.descripcion" class="cell-input cell-input--textarea" rows="1"></textarea>
                </td>
                <td>
                  <span
                    v-if="row.isValid"
                    class="row-status row-status--valid"
                  >
                    <span class="material-symbols-outlined">check_circle</span>
                  </span>
                  <span
                    v-else
                    class="row-status row-status--invalid error-tooltip-trigger"
                    :title="(row.errors ?? []).join('\n')"
                  >
                    <span class="material-symbols-outlined">error</span>
                    <span class="error-tooltip">
                      <span
                        v-for="(err, eIdx) in row.errors"
                        :key="eIdx"
                        class="error-tooltip__item"
                      >• {{ err }}</span>
                    </span>
                  </span>
                </td>
                <td>
                  <button class="row-delete" title="Eliminar fila" @click="removeRow(idx)">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
              <tr v-if="!previewRows.length">
                <td colspan="8" class="empty-preview">No hay filas para mostrar</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="invalidCount > 0" class="errors-panel">
          <div class="errors-panel__title">
            <span class="material-symbols-outlined">warning</span>
            Filas con errores (se excluirán al importar)
          </div>
          <ul class="errors-list">
            <li v-for="(row, idx) in previewRows.filter(r => !r.isValid)" :key="`err-${idx}`">
              <strong>Fila {{ previewRows.indexOf(row) + 1 }}:</strong>
              {{ row.errors?.join('; ') }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="footer-actions">
        <w-button variant="ghost" @click="close">Cancelar</w-button>
        <w-button
          v-if="step === 'preview'"
          variant="primary"
          :loading="importing"
          :disabled="validCount === 0"
          @click="confirmImport"
        >
          <span class="material-symbols-outlined mr-2">check</span>
          Importar {{ validCount }} publicación{{ validCount === 1 ? '' : 'es' }}
        </w-button>
      </div>
    </template>
  </w-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { useMarketingStore } from '@/stores/marketing.store'
import { useToast } from '@/composables/useToast'
import WDrawer from '@/components/ui/WDrawer.vue'
import WButton from '@/components/ui/WButton.vue'
import { NETWORK_OPTIONS } from '@/api/marketing/marketing-shared.types'
import type { MarketingNetwork, MarketingStatus } from '@/api/marketing/marketing-shared.types'
import type { MarketingPostFormat } from '@/api/marketing/marketing-posts.types'
import type { PreviewImportRow, ImportPostRowDto } from '@/api/marketing/marketing-import.types'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

const FORMAT_OPTIONS: { value: MarketingPostFormat; label: string }[] = [
  { value: 'carousel', label: 'Carrusel' },
  { value: 'reel', label: 'Reel' },
  { value: 'article', label: 'Artículo' },
  { value: 'image', label: 'Imagen' },
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Texto' },
  { value: 'story', label: 'Historia' },
  { value: 'poll', label: 'Encuesta' },
  { value: 'event', label: 'Evento' },
]

export default defineComponent({
  name: 'PostImportModal',
  components: { WDrawer, WButton },
  props: {
    modelValue: { type: Boolean, required: true },
  },
  emits: ['update:modelValue', 'imported'],
  setup(props, { emit }) {
    const store = useMarketingStore()
    const show = computed({
      get: () => props.modelValue,
      set: (v) => emit('update:modelValue', v),
    })

    const step = ref<'upload' | 'preview'>('upload')
    const isDragging = ref(false)
    const parsing = ref(false)
    const importing = ref(false)
    const fileInput = ref<HTMLInputElement | null>(null)
    const previewRows = ref<PreviewImportRow[]>([])

    const title = computed(() =>
      step.value === 'upload' ? 'Importar publicaciones' : 'Revisar y confirmar importación',
    )

    const validCount = computed(() => previewRows.value.filter((r) => r.isValid).length)
    const invalidCount = computed(() => previewRows.value.filter((r) => !r.isValid).length)

    watch(show, (val) => {
      if (val) resetToUpload()
    })

    function triggerFileInput() {
      fileInput.value?.click()
    }

    function onFileSelected(e: Event) {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) handleFile(file)
      target.value = ''
    }

    function onDrop(e: DragEvent) {
      isDragging.value = false
      const file = e.dataTransfer?.files?.[0]
      if (file) handleFile(file)
    }

    async function handleFile(file: File) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        useToast().error(
          `El archivo pesa ${(file.size / (1024 * 1024)).toFixed(1)}MB y supera el máximo permitido de 10MB. Reducí la cantidad de filas o el tamaño del archivo.`,
        )
        return
      }
      parsing.value = true
      try {
        const result = await store.previewImport(file)
        previewRows.value = result.rows
        step.value = 'preview'
      } catch {
        // error toast shown by store
      } finally {
        parsing.value = false
      }
    }

    function revalidateRow(row: PreviewImportRow) {
      const errors: string[] = []
      if (!row.dia) errors.push('Columna "dia" es obligatoria')
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.dia)) errors.push('Formato de fecha inválido')
      if (!row.red) errors.push('Columna "red" es obligatoria')
      if (!row.formato) errors.push('Columna "formato" es obligatoria')
      if (!row.contenidoTitulo) errors.push('Columna "contenido/titulo" es obligatoria')
      else if (row.contenidoTitulo.length > 200) errors.push('El título no puede exceder 200 caracteres')
      row.errors = errors.length > 0 ? errors : undefined
      row.isValid = errors.length === 0
    }

    function removeRow(idx: number) {
      previewRows.value.splice(idx, 1)
    }

    function resetToUpload() {
      step.value = 'upload'
      previewRows.value = []
      parsing.value = false
    }

    function close() {
      show.value = false
    }

    async function downloadTemplate() {
      await store.downloadImportTemplate()
    }

    async function confirmImport() {
      importing.value = true
      try {
        const validRows = previewRows.value.filter((r) => r.isValid)
        const posts: ImportPostRowDto[] = validRows.map((r) => ({
          scheduledDate: r.dia,
          network: r.red as MarketingNetwork,
          format: r.formato as MarketingPostFormat,
          title: r.contenidoTitulo,
          copyText: r.descripcion,
          status: (r.status ?? 'idea') as MarketingStatus,
        }))
        await store.confirmImport({ posts })
        emit('imported')
        close()
      } catch {
        // error toast shown by store
      } finally {
        importing.value = false
      }
    }

    return {
      show,
      title,
      step,
      isDragging,
      parsing,
      importing,
      fileInput,
      previewRows,
      validCount,
      invalidCount,
      NETWORK_OPTIONS,
      FORMAT_OPTIONS,
      triggerFileInput,
      onFileSelected,
      onDrop,
      revalidateRow,
      removeRow,
      resetToUpload,
      close,
      downloadTemplate,
      confirmImport,
    }
  },
})
</script>

<style scoped>
.import-modal { display: flex; flex-direction: column; gap: 20px; }

.step-description { font-size: 13px; color: var(--color-text-muted); line-height: 1.6; margin: 0; }
.step-description strong { color: var(--color-text-base); font-family: var(--font-mono); font-size: 12px; }
.step-description--hint { color: var(--color-text-muted); font-size: 12px; }

.upload-actions { display: flex; justify-content: flex-end; }

.dropzone {
  border: 2px dashed var(--color-border); border-radius: 8px; padding: 48px 24px;
  text-align: center; cursor: pointer; transition: all 0.2s;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.dropzone:hover, .dropzone--active {
  border-color: var(--color-primary); background-color: var(--color-bg-surface-high);
}
.dropzone__icon { font-size: 48px; color: var(--color-text-muted); }
.dropzone__text { font-size: 14px; color: var(--color-text-base); margin: 0; }
.dropzone__hint { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); text-transform: uppercase; margin: 0; }

.hidden-file-input { display: none; }

.state-message {
  display: flex; align-items: center; gap: 10px; color: var(--color-text-muted);
  font-family: var(--font-mono); font-size: 12px; text-transform: uppercase;
}
.spinning { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.preview-summary {
  display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  padding: 12px 16px; background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
}
.summary-item { font-size: 13px; color: var(--color-text-muted); display: flex; align-items: center; gap: 6px; }
.summary-item strong { color: var(--color-text-base); }
.summary-item--valid { color: #10B981; }
.summary-item--invalid { color: var(--color-error); }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot--valid { background: #10B981; }
.dot--invalid { background: var(--color-error); }

.preview-table-wrap { overflow-x: auto; border: 1px solid var(--color-border); }
.preview-table { width: 100%; border-collapse: collapse; min-width: 800px; }
.preview-table thead th {
  background: var(--color-bg-base); color: var(--color-text-muted);
  font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--color-border);
  position: sticky; top: 0; z-index: 1;
}
.preview-table tbody tr { border-bottom: 1px solid var(--color-border-subtle); }
.preview-table tbody tr.row--invalid { background: rgba(239, 68, 68, 0.04); }
.preview-table tbody td { padding: 8px 12px; vertical-align: middle; }
.cell-row-index { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }

.cell-input {
  width: 100%; padding: 6px 8px; background: var(--color-bg-base);
  border: 1px solid var(--color-border); color: var(--color-text-base);
  font-size: 12px; font-family: var(--font-body); transition: border-color 0.15s;
}
.cell-input:focus { outline: none; border-color: var(--color-primary); }
.cell-input--textarea { resize: vertical; min-height: 32px; max-height: 80px; }

.row-status { display: flex; align-items: center; justify-content: center; }
.row-status .material-symbols-outlined { font-size: 18px; }
.row-status--valid { color: #10B981; }
.row-status--invalid { color: var(--color-error); }

.error-tooltip-trigger { position: relative; cursor: help; }
.error-tooltip {
  position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
  background: var(--color-bg-surface); border: 1px solid var(--color-error);
  padding: 10px 12px; border-radius: 4px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  min-width: 220px; max-width: 300px; z-index: 50;
  opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.15s, visibility 0.15s;
  display: flex; flex-direction: column; gap: 4px;
}
.error-tooltip::after {
  content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
  border: 5px solid transparent; border-top-color: var(--color-error);
}
.error-tooltip__item {
  font-family: var(--font-body); font-size: 11px; color: var(--color-text-base);
  line-height: 1.4; white-space: normal; word-break: break-word;
}
.error-tooltip-trigger:hover .error-tooltip {
  opacity: 1; visibility: visible; pointer-events: auto;
}

.row-delete {
  background: none; border: none; color: var(--color-text-muted);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  padding: 4px; transition: color 0.15s;
}
.row-delete:hover { color: var(--color-error); }
.row-delete .material-symbols-outlined { font-size: 18px; }

.empty-preview { text-align: center; color: var(--color-text-muted); padding: 24px; }

.errors-panel {
  border: 1px solid var(--color-error); background: rgba(239, 68, 68, 0.04);
  padding: 16px; border-radius: 4px;
}
.errors-panel__title {
  display: flex; align-items: center; gap: 8px; font-family: var(--font-mono);
  font-size: 11px; text-transform: uppercase; color: var(--color-error); margin-bottom: 8px;
}
.errors-panel__title .material-symbols-outlined { font-size: 16px; }
.errors-list { margin: 0; padding-left: 20px; font-size: 12px; color: var(--color-text-muted); }
.errors-list li { margin-bottom: 4px; }
.errors-list strong { color: var(--color-text-base); }

.footer-actions { display: flex; justify-content: flex-end; gap: 12px; }
.mr-2 { margin-right: 8px; }
</style>
