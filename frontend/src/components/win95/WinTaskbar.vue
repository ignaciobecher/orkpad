<template>
  <div class="w95-taskbar">
    <button
      class="w95-btn w95-start-btn"
      :class="{ 'w95-start-btn--active': win95.startOpen }"
      @click="win95.toggleStart()"
      aria-label="Inicio"
    >
      <win-icon name="windows" :size="16" alt="Windows" />
      Inicio
    </button>

    <div class="w95-taskbar-sep"></div>

    <button
      v-for="w in win95.taskbarWindows"
      :key="w.route"
      class="w95-btn w95-task"
      :class="{ 'w95-task--active': w.route === win95.activeRoute && !w.minimized }"
      :title="`${w.title} — clic: cambiar · clic derecho: opciones`"
      @click="onTaskClick(w.route)"
      @contextmenu.prevent="openCtx($event, w.route)"
    >
      <win-icon :name="w.icon" :size="16" :alt="w.title" />
      <span class="task-label">{{ w.title }}</span>
    </button>

    <div class="w95-tray" title="Bandeja del sistema">
      <button class="tray-icon-btn" @click="toggleLocale" :title="locale === 'es' ? 'Cambiar a English' : 'Cambiar a Español'">
        {{ locale === 'es' ? 'ES' : 'EN' }}
      </button>
      <button v-if="unreadCount > 0" class="tray-icon-btn tray-mail" @click="goNotifications" title="Notificaciones">
        <win-icon name="mail" :size="16" alt="Correo" />{{ unreadCount }}
      </button>
      <span class="tray-clock">{{ clock }}</span>
    </div>

    <!-- Menú contextual de task buttons, como en Win95 -->
    <div
      v-if="ctx.open"
      class="w95-ctxmenu w95-outset"
      :style="{ left: ctx.x + 'px', bottom: ctx.y + 'px' }"
      @click.stop
    >
      <button class="w95-ctxitem" @click="ctxRestore">
        <span v-if="ctxMinimized">Restaurar</span><span v-else>Minimizar</span>
      </button>
      <button class="w95-ctxitem" @click="ctxMaximize">Maximizar</button>
      <div class="w95-separator"></div>
      <button class="w95-ctxitem" @click="ctxClose">Cerrar</button>
      <button class="w95-ctxitem w95-ctxitem--bold" @click="ctxCloseAll">Cerrar todas las ventanas</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useWin95Store } from '@/stores/win95.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import WinIcon from './WinIcon.vue'

export default defineComponent({
  name: 'WinTaskbar',
  components: { WinIcon },
  setup() {
    const win95 = useWin95Store()
    const notificationsStore = useNotificationsStore()
    const router = useRouter()
    const { locale } = useI18n()
    const clock = ref('')
    const ctx = ref({ open: false, x: 0, y: 0, route: '' })
    let timer: ReturnType<typeof setInterval> | null = null

    const unreadCount = computed(() => notificationsStore.unreadCount || 0)
    const ctxMinimized = computed(() => {
      const w = win95.windows.find((x) => x.route === ctx.value.route)
      return !!w?.minimized
    })

    function tick() {
      const d = new Date()
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      clock.value = `${hh}:${mm}`
    }

    function go(route: string) {
      win95.focus(route)
      router.push({ name: route as never }).catch(() => {})
    }

    function onTaskClick(route: string) {
      closeCtx()
      const win = win95.windows.find((w) => w.route === route)
      if (!win) return
      if (win.route === win95.activeRoute && !win.minimized) {
        win95.minimize(route)
      } else {
        go(route)
      }
    }

    function openCtx(e: MouseEvent, route: string) {
      ctx.value = {
        open: true,
        x: Math.min(e.clientX, window.innerWidth - 220),
        y: window.innerHeight - e.clientY + 4,
        route,
      }
    }

    function closeCtx() {
      ctx.value.open = false
    }

    function ctxRestore() {
      const r = ctx.value.route
      closeCtx()
      if (!r) return
      const w = win95.windows.find((x) => x.route === r)
      if (w?.minimized || w?.route !== win95.activeRoute) go(r)
      else win95.minimize(r)
    }

    function ctxMaximize() {
      const r = ctx.value.route
      closeCtx()
      if (!r) return
      const w = win95.windows.find((x) => x.route === r)
      if (w && !w.maximized) win95.toggleMaximize(r)
      go(r)
    }

    function ctxClose() {
      const r = ctx.value.route
      closeCtx()
      if (!r) return
      const next = win95.nextAfterClose(r)
      win95.close(r)
      if (next !== r) {
        win95.focus(next)
        router.push({ name: next as never }).catch(() => {})
      } else {
        win95.ensureWindow('dashboard')
        router.push({ name: 'dashboard' as never }).catch(() => {})
      }
    }

    function ctxCloseAll() {
      closeCtx()
      win95.closeAll('dashboard')
      win95.ensureWindow('dashboard')
      router.push({ name: 'dashboard' as never }).catch(() => {})
    }

    function toggleLocale() {
      locale.value = locale.value === 'es' ? 'en' : 'es'
    }

    function goNotifications() {
      win95.ensureWindow('notifications')
      router.push({ name: 'notifications' as never }).catch(() => {})
    }

    function onGlobalClick() {
      closeCtx()
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeCtx()
        win95.toggleStart(false)
      }
    }

    onMounted(() => {
      tick()
      timer = setInterval(tick, 15000)
      window.addEventListener('click', onGlobalClick)
      window.addEventListener('keydown', onKey)
    })
    onUnmounted(() => {
      if (timer) clearInterval(timer)
      window.removeEventListener('click', onGlobalClick)
      window.removeEventListener('keydown', onKey)
    })

    return { win95, clock, unreadCount, locale, ctx, ctxMinimized, onTaskClick, openCtx, ctxRestore, ctxMaximize, ctxClose, ctxCloseAll, toggleLocale, goNotifications }
  }
})
</script>

<style scoped>
.w95-taskbar-sep {
  width: 2px;
  border-left: 1px solid var(--w95-shadow);
  border-right: 1px solid var(--w95-highlight);
  margin: 2px 1px;
}
.task-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tray-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  color: #000;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 0 2px;
}
.tray-mail {
  font-weight: bold;
}
.tray-clock {
  font-size: 11px;
}
.w95-ctxmenu {
  position: fixed;
  z-index: 6000;
  min-width: 210px;
  padding: 2px;
  display: flex;
  flex-direction: column;
}
.w95-ctxitem {
  background: none;
  border: none;
  text-align: left;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 12px;
  color: #000;
  padding: 5px 12px;
  cursor: pointer;
}
.w95-ctxitem:hover {
  background: var(--w95-navy);
  color: #fff;
}
.w95-ctxitem--bold {
  font-weight: bold;
}
.w95-separator {
  margin: 2px;
}
</style>
