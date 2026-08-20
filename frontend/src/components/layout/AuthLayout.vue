<template>
  <div class="auth-layout">
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
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AuthLayout'
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
