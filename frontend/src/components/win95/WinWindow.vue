<template>
  <div
    class="w95-window"
    :class="{ 'w95-window--max': win.maximized, 'w95-window--inactive': !isActive }"
    :style="winStyle"
    @mousedown="focus"
  >
    <div
      class="w95-titlebar"
      :class="{ 'w95-titlebar--inactive': !isActive }"
      @mousedown="startDrag"
      @dblclick="win95.toggleMaximize(win.route)"
    >
      <win-icon :name="win.icon" :size="16" :alt="win.title" />
      <span class="title-text">{{ win.title }} — Orkpad95</span>
      <div class="w95-titlebar-buttons" @mousedown.stop>
        <button class="w95-title-btn" @click.stop="win95.minimize(win.route)" title="Minimizar">
          <span class="tbtn-min" aria-hidden="true"></span>
        </button>
        <button
          class="w95-title-btn"
          @click.stop="win95.toggleMaximize(win.route)"
          :title="win.maximized ? 'Restaurar' : 'Maximizar'"
        >
          <span v-if="win.maximized" class="tbtn-restore" aria-hidden="true"></span>
          <span v-else class="tbtn-max" aria-hidden="true"></span>
        </button>
        <button class="w95-title-btn" @click.stop="closeWindow" title="Cerrar">
          <span class="tbtn-close" aria-hidden="true">×</span>
        </button>
      </div>
    </div>
    <div class="w95-menubar" aria-hidden="true">
      <span>Archivo</span><span>Edición</span><span>Ver</span><span>Ayuda</span>
    </div>
    <div class="w95-window-body" :class="{ 'w95-loading': loading }">
      <slot></slot>
    </div>
    <div class="w95-statusbar">
      <span class="w95-statusbar-field">{{ statusLeft }}</span>
      <span class="w95-statusbar-field w95-statusbar-field--fixed">{{ statusRight }}</span>
    </div>
    <template v-if="!win.maximized">
      <div class="w95-resize w95-resize--corner" @mousedown="startResize($event, 'both')"></div>
      <div class="w95-resize w95-resize--right" @mousedown="startResize($event, 'w')"></div>
      <div class="w95-resize w95-resize--bottom" @mousedown="startResize($event, 'h')"></div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWin95Store, type Win95Window } from '@/stores/win95.store'
import { useUIStore } from '@/stores/ui.store'
import WinIcon from './WinIcon.vue'

export default defineComponent({
  name: 'WinWindow',
  components: { WinIcon },
  props: {
    win: { type: Object as PropType<Win95Window>, required: true },
    statusLeft: { type: String, default: 'Listo' },
    statusRight: { type: String, default: 'ORKPAD95' },
  },
  setup(props) {
    const win95 = useWin95Store()
    const uiStore = useUIStore()
    const router = useRouter()

    const isActive = computed(() => win95.activeRoute === props.win.route && !props.win.minimized)
    const loading = computed(() => uiStore.globalLoading)

    const winStyle = computed(() => {
      const base: Record<string, string | number> = { zIndex: props.win.z }
      if (props.win.maximized) return base
      const w = Math.min(window.innerWidth - 16, 1100)
      return {
        ...base,
        position: 'fixed' as const,
        left: `${props.win.x}px`,
        top: `${props.win.y}px`,
        width: `min(${w}px, calc(100vw - 16px))`,
        maxHeight: 'calc(100vh - 70px)',
      }
    })

    function focus() {
      win95.focus(props.win.route)
    }

    function closeWindow() {
      const route = props.win.route
      const next = win95.nextAfterClose(route)
      win95.close(route)
      if (next !== route) {
        router.push({ name: next as never }).catch(() => {})
      } else {
        // Era la última: se reasegura dashboard (el escritorio nunca queda huérfano)
        win95.ensureWindow('dashboard')
        router.push({ name: 'dashboard' as never }).catch(() => {})
      }
    }

    function startDrag(e: MouseEvent) {
      if (props.win.maximized || window.innerWidth < 768) return
      if ((e.target as HTMLElement).closest('.w95-titlebar-buttons')) return
      const startX = e.clientX - props.win.x
      const startY = e.clientY - props.win.y
      focus()
      const onMove = (ev: MouseEvent) => win95.move(props.win.route, ev.clientX - startX, ev.clientY - startY)
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }

    function startResize(e: MouseEvent, mode: 'both' | 'w' | 'h') {
      e.preventDefault()
      e.stopPropagation()
      const el = (e.target as HTMLElement).closest('.w95-window') as HTMLElement
      if (!el) return
      const startW = el.offsetWidth
      const startH = el.offsetHeight
      const startX = e.clientX
      const startY = e.clientY
      focus()
      const onMove = (ev: MouseEvent) => {
        if (mode !== 'h') {
          const w = Math.max(320, Math.min(window.innerWidth - 16, startW + (ev.clientX - startX)))
          el.style.width = `${w}px`
        }
        if (mode !== 'w') {
          const h = Math.max(200, Math.min(window.innerHeight - 60, startH + (ev.clientY - startY)))
          el.style.height = `${h}px`
        }
      }
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }

    return { win95, isActive, loading, winStyle, focus, closeWindow, startDrag, startResize }
  },
})
</script>

<style scoped>
.w95-window {
  position: fixed;
  left: 24px;
  top: 16px;
  width: min(1100px, calc(100vw - 16px));
  max-height: calc(100vh - 70px);
}
.w95-window--max {
  left: 0 !important;
  top: 0 !important;
  width: 100vw !important;
  height: calc(100vh - var(--w95-taskbar-height)) !important;
  max-height: none;
}
.w95-window--inactive {
  box-shadow: inset 1px 1px 0 var(--w95-face-light), inset -1px -1px 0 var(--w95-shadow);
}
.title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Glifos de botones estilo Marlett dibujados con CSS */
.w95-title-btn {
  position: relative;
}
.tbtn-min {
  position: absolute;
  left: 3px;
  bottom: 3px;
  width: 8px;
  height: 2px;
  background: #000;
}
.tbtn-max {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 10px;
  height: 9px;
  border: 1px solid #000;
  border-top-width: 2px;
  box-sizing: border-box;
}
.tbtn-restore {
  position: absolute;
  left: 3px;
  top: 1px;
  width: 10px;
  height: 11px;
  box-sizing: border-box;
}
.tbtn-restore::before {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 7px;
  height: 6px;
  border: 1px solid #000;
  border-top-width: 2px;
  background: var(--w95-face);
  box-sizing: border-box;
}
.tbtn-restore::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 7px;
  height: 6px;
  border: 1px solid #000;
  border-top-width: 2px;
  background: var(--w95-face);
  box-sizing: border-box;
}
.tbtn-close {
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  font-weight: bold;
  line-height: 1;
  color: #000;
}
.w95-statusbar-field--fixed {
  flex: 0 0 140px;
  text-align: right;
}
.w95-resize {
  position: absolute;
  z-index: 5;
}
.w95-resize--corner {
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, var(--w95-shadow) 50%);
}
.w95-resize--right {
  right: 0;
  top: 30px;
  bottom: 16px;
  width: 5px;
  cursor: ew-resize;
}
.w95-resize--bottom {
  left: 8px;
  right: 16px;
  bottom: 0;
  height: 5px;
  cursor: ns-resize;
}
@media (max-width: 768px) {
  .w95-window {
    left: 0 !important;
    top: 0 !important;
    width: 100vw !important;
    height: calc(100vh - var(--w95-taskbar-height)) !important;
    max-height: none;
  }
  .w95-menubar {
    display: none;
  }
  .w95-resize {
    display: none;
  }
}
</style>
