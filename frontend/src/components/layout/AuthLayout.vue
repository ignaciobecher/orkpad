<template>
  <!-- Clásica: layout original sobrio -->
  <div v-if="uiStore.appearance === 'classic'" class="auth-layout">
    <div class="auth-container">
      <slot></slot>
    </div>

    <div class="auth-footer">
      <div class="footer-status">
        <span class="status-dot"></span>
        <span class="status-text">v1.0.4-stable</span>
      </div>
      <div class="footer-info">
        <span class="info-item">LATENCY: 14MS</span>
        <span class="info-item">ENCRYPTION: AES-256</span>
      </div>
    </div>
  </div>
  <!-- Win95: ventana de bienvenida retro -->
  <div v-else class="auth-layout w95-desktop">
    <div class="auth-boot">Microsoft(R) Windows 95<br />Orkpad95 [Versión 4.00.950]</div>
    <div class="auth-window w95-window">
      <div class="w95-titlebar">
        <win-icon name="key" :size="16" alt="Acceso" />
        <span class="title-text">Bienvenido a Orkpad95</span>
        <div class="w95-titlebar-buttons">
          <span class="w95-title-btn" aria-hidden="true">_</span>
          <span class="w95-title-btn" aria-hidden="true">☐</span>
          <span class="w95-title-btn" aria-hidden="true">✕</span>
        </div>
      </div>
      <div class="w95-menubar"><span>Archivo</span><span>Ayuda</span></div>
      <div class="auth-container">
        <slot></slot>
      </div>
      <div class="w95-statusbar">
        <span class="w95-statusbar-field">C:\ORKPAD\LOGIN</span>
        <span class="w95-statusbar-field w95-statusbar-field--fixed">ORKPAD95</span>
      </div>
    </div>
    <div class="auth-footer">
      <div class="footer-status">
        <span class="status-block"></span>
        <span class="status-text">v1.0.4-stable</span>
      </div>
      <div class="footer-info">
        <span class="info-item">LATENCY: 14MS</span>
        <span class="info-item">ENCRYPTION: AES-256</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import WinIcon from '@/components/win95/WinIcon.vue'
import { useUIStore } from '@/stores/ui.store'

export default defineComponent({
  name: 'AuthLayout',
  components: { WinIcon },
  setup() {
    const uiStore = useUIStore()
    return { uiStore }
  }
})
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background-color: var(--color-bg-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 24px;
}

.auth-footer {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-disabled);
}

@media (max-width: 640px) {
  .auth-footer {
    position: static;
    margin-top: 32px;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 24px;
  }
}

.footer-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background-color: var(--color-success);
  border-radius: 50%;
}

.footer-info {
  display: flex;
  gap: 24px;
}

.info-item {
  letter-spacing: 0.1em;
}
</style>

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .auth-layout {
min-height: 100vh;
  background: var(--w95-teal);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 24px 16px 60px;
}

html[data-appearance="win95"] .auth-boot {
color: #fff;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 12px;
  text-align: center;
  margin-bottom: 14px;
  line-height: 1.5;
}

html[data-appearance="win95"] .auth-window {
width: 100%;
  max-width: 420px;
  padding: 2px;
}

html[data-appearance="win95"] .title-ico {
font-size: 14px;
}

html[data-appearance="win95"] .title-text {
font-weight: bold; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

html[data-appearance="win95"] .auth-container {
padding: 14px;
  background: var(--w95-face);
}

html[data-appearance="win95"] .auth-footer {
position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--w95-taskbar-height);
  background: var(--w95-face);
  border-top: 2px solid var(--w95-highlight);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  color: #000;
}

html[data-appearance="win95"] .footer-status {
display: flex;
  align-items: center;
  gap: 8px;
}

html[data-appearance="win95"] .status-block {
width: 10px;
  height: 14px;
  background: var(--w95-navy);
  display: inline-block;
}

html[data-appearance="win95"] .footer-info {
display: flex;
  gap: 16px;
}

@media (max-width: 640px) {
html[data-appearance="win95"] .footer-info {
display: none;
}
}
</style>
