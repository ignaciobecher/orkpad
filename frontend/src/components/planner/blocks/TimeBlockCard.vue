<template>
  <div
    class="tbc"
    :class="[`status-${block.status}`, { 'is-focus': block.isFocusBlock }]"
    :style="cardStyle"
  >
    <!-- Franja de color izquierda -->
    <div class="tbc__accent" :style="{ background: block.color }" />

    <!-- Contenido -->
    <div class="tbc__body">
      <!-- Fila superior: check + título + badge -->
      <div class="tbc__top">
        <!-- Botón completar: grande, prominente -->
        <button
          class="tbc__check"
          :class="{ 'is-done': block.status === 'completed' }"
          :title="block.status === 'completed' ? 'Marcar pendiente' : 'Marcar completado'"
          @click.stop="$emit('complete', block)"
        >
          <span v-if="block.status === 'completed'" class="w95-check w95-check--done" aria-hidden="true">✓</span>
          <span v-else class="w95-check" aria-hidden="true"></span>
        </button>

        <div class="tbc__title-wrap">
          <span class="tbc__title">{{ block.title }}</span>
          <span class="tbc__time">{{ block.startTime }} – {{ block.endTime }}</span>
        </div>

        <BlockStatusChip :status="block.status" class="tbc__status-chip" @click.stop="$emit('complete', block)" />
      </div>

      <!-- Categoría (sólo si hay espacio — bloque > 40px) -->
      <div v-if="tall" class="tbc__cat">
        <win-icon :name="categoryToWinIcon(block.category)" :size="13" alt="" />
        {{ categoryLabel(block.category) }}
      </div>

      <!-- Barra de progreso de tareas -->
      <div v-if="completionRate > 0 && tall" class="tbc__progress">
        <div class="tbc__progress-fill" :style="{ width: completionRate + '%', background: block.color }" />
      </div>
    </div>

    <!-- Acciones: aparecen en hover en la esquina inferior derecha -->
    <div class="tbc__actions" @click.stop>
      <button @click.stop="$emit('edit', block)" title="Editar">
        <win-icon name="paint" :size="14" />
      </button>
      <button @click.stop="$emit('duplicate', block)" title="Duplicar">
        <win-icon name="notepad-file" :size="14" />
      </button>
      <button class="tbc__actions-del" @click.stop="$emit('delete', block)" title="Eliminar">
        <win-icon name="recycle" :size="14" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { usePlannerTasksStore } from '@/stores/planner-tasks.store'
import BlockStatusChip from './BlockStatusChip.vue'
import WinIcon from '@/components/win95/WinIcon.vue'
import { categoryToWinIcon } from '@/components/win95/icons'
import type { PlannerBlock } from '@/api/planner/planner.types'

const CATEGORY_LABELS: Record<string, string> = {
  'trabajo': 'Trabajo',
  'foco-profundo': 'Foco profundo',
  'administracion': 'Administración',
  'estudio': 'Estudio',
  'gimnasio': 'Gimnasio',
  'descanso': 'Descanso',
  'personal': 'Personal',
  'reunion': 'Reunión',
  'creativo': 'Creativo',
  'habitos': 'Hábitos',
  // compatibilidad inglés
  'work': 'Trabajo',
  'deep-work': 'Foco profundo',
  'admin': 'Administración',
  'study': 'Estudio',
  'gym': 'Gimnasio',
  'rest': 'Descanso',
  'meeting': 'Reunión',
  'creative': 'Creativo',
}

export default defineComponent({
  name: 'TimeBlockCard',
  components: { BlockStatusChip, WinIcon },
  methods: { categoryToWinIcon },
  props: {
    block: { type: Object as () => PlannerBlock, required: true },
    // altura del bloque en píxeles (pasada desde DayView para saber si mostrar info extra)
    heightPx: { type: Number, default: 64 },
  },
  emits: ['click', 'edit', 'duplicate', 'delete', 'complete'],
  setup(props) {
    const tasksStore = usePlannerTasksStore()
    const completionRate = computed(() => tasksStore.completionRate(props.block._id))

    // ¿El bloque tiene suficiente altura para mostrar categoría + barra?
    const tall = computed(() => props.heightPx >= 52)

    const cardStyle = computed(() => ({
      background: props.block.color + '18',  // color del bloque con 10% opacidad
      borderColor: props.block.color + '55',
    }))

    function categoryLabel(cat: string) {
      return CATEGORY_LABELS[cat] ?? cat
    }

    return { completionRate, tall, cardStyle, categoryLabel }
  },
})
</script>

<style scoped>
.tbc {
  position: relative;
  display: flex;
  height: 100%;
  border: 1px solid;
  overflow: hidden;
  cursor: pointer;
  transition: filter 0.15s;
  box-sizing: border-box;
}

.tbc:hover { filter: brightness(1.08); }

/* Franja de color izquierda */
.tbc__accent {
  width: 4px;
  flex-shrink: 0;
  border-radius: 0;
}

/* Cuerpo del bloque */
.tbc__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 6px;
  min-width: 0;
  overflow: hidden;
}

/* Fila superior */
.tbc__top {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

/* Botón de completar */
.tbc__check {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: var(--color-text-disabled);
  transition: color 0.15s, transform 0.15s;
}

.tbc__check:hover { color: var(--color-success); transform: scale(1.15); }
.tbc__check.is-done { color: var(--color-success); }
.tbc__check .material-symbols-outlined { font-size: 18px; }

/* Título y hora */
.tbc__title-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.tbc__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.status-completed .tbc__title {
  text-decoration: line-through;
  opacity: 0.6;
}

.tbc__time {
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  line-height: 1.2;
}

/* Categoría */
.tbc__cat {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--color-text-muted);
}

.tbc__cat .material-symbols-outlined { font-size: 11px; }

/* Barra de progreso de tareas */
.tbc__progress {
  height: 2px;
  background: var(--color-border);
  margin-top: auto;
  overflow: hidden;
}

.tbc__progress-fill {
  height: 100%;
  transition: width 0.3s;
}

/* Acciones — fila inferior visible sólo en hover */
.tbc__actions {
  position: absolute;
  bottom: 3px;
  right: 3px;
  display: none;
  gap: 2px;
  z-index: 5;
}

.tbc:hover .tbc__actions { display: flex; }

/* On touch devices show actions always (no hover) */
@media (hover: none) {
  .tbc__actions { display: flex; }
}

.tbc__actions button {
  background: var(--color-bg-surface-highest);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  width: 22px;
  height: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  padding: 0;
}

.tbc__actions button:hover {
  background: var(--color-bg-surface-high);
  color: var(--color-text-base);
}

.tbc__actions-del:hover {
  color: var(--color-error) !important;
}

.tbc__actions .material-symbols-outlined { font-size: 13px; }

.tbc__status-chip {
  cursor: pointer;
  transition: opacity 0.15s;
}
.tbc__status-chip:hover { opacity: 0.75; }

/* Status */
.status-completed { opacity: 0.65; }
.status-skipped { opacity: 0.45; }
</style>

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .tbc {
position: relative;
  display: flex;
  height: 100%;
  border: 1px solid;
  overflow: hidden;
  cursor: pointer;
  transition: filter 0.15s;
  box-sizing: border-box;
}

html[data-appearance="win95"] .tbc:hover {
filter: brightness(1.08);
}

html[data-appearance="win95"] .tbc__accent {
width: 4px;
  flex-shrink: 0;
  border-radius: 0;
}

html[data-appearance="win95"] .tbc__body {
flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 6px;
  min-width: 0;
  overflow: hidden;
}

html[data-appearance="win95"] .tbc__top {
display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

html[data-appearance="win95"] .tbc__check {
background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: var(--color-text-disabled);
  transition: color 0.15s, transform 0.15s;
}

html[data-appearance="win95"] .tbc__check:hover {
color: var(--color-success);
}

html[data-appearance="win95"] .tbc__check.is-done {
color: var(--color-success);
}

html[data-appearance="win95"] .tbc__check .w95-check {
display: inline-block;
  width: 15px;
  height: 15px;
  background: #fff;
  border: 1px solid;
  border-color: var(--w95-shadow) var(--w95-highlight) var(--w95-highlight) var(--w95-shadow);
  box-shadow: inset 1px 1px 0 var(--w95-darkshadow);
  font-size: 11px;
  font-weight: bold;
  line-height: 13px;
  text-align: center;
  color: #000;
}

html[data-appearance="win95"] .tbc__title-wrap {
flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

html[data-appearance="win95"] .tbc__title {
font-size: 12px;
  font-weight: 600;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

html[data-appearance="win95"] .status-completed .tbc__title {
text-decoration: line-through;
  opacity: 0.6;
}

html[data-appearance="win95"] .tbc__time {
font-size: 10px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  line-height: 1.2;
}

html[data-appearance="win95"] .tbc__cat {
display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .tbc__cat .material-symbols-outlined {
font-size: 11px;
}

html[data-appearance="win95"] .tbc__progress {
height: 6px;
  background: #fff;
  border: 1px solid;
  border-color: var(--w95-shadow) var(--w95-highlight) var(--w95-highlight) var(--w95-shadow);
  margin-top: auto;
  overflow: hidden;
}

html[data-appearance="win95"] .tbc__progress-fill {
height: 100%;
  transition: width 0.3s;
}

html[data-appearance="win95"] .tbc__actions {
position: absolute;
  bottom: 3px;
  right: 3px;
  display: none;
  gap: 2px;
  z-index: 5;
}

html[data-appearance="win95"] .tbc:hover .tbc__actions {
display: flex;
}

@media (hover: none) {
html[data-appearance="win95"] .tbc__actions {
display: flex;
}
}

html[data-appearance="win95"] .tbc__actions button {
background: var(--color-bg-surface-highest);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  width: 22px;
  height: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  padding: 0;
}

html[data-appearance="win95"] .tbc__actions button:hover {
background: var(--color-bg-surface-high);
  color: var(--color-text-base);
}

html[data-appearance="win95"] .tbc__actions-del:hover {
color: var(--color-error) !important;
}

html[data-appearance="win95"] .tbc__actions .material-symbols-outlined {
font-size: 13px;
}

html[data-appearance="win95"] .tbc__status-chip {
cursor: pointer;
  transition: opacity 0.15s;
}

html[data-appearance="win95"] .tbc__status-chip:hover {
opacity: 0.75;
}

html[data-appearance="win95"] .status-completed {
opacity: 0.65;
}

html[data-appearance="win95"] .status-skipped {
opacity: 0.45;
}
</style>
