<script setup lang="ts">
import type { PortfolioSeo } from '@/api/portfolio/portfolio-builder.types'

defineProps<{ seo: PortfolioSeo }>()
const emit = defineEmits<{ update: [seo: Partial<PortfolioSeo>] }>()

function set(key: keyof PortfolioSeo, value: string) {
  emit('update', { [key]: value })
}
</script>

<template>
  <div class="se">
    <div class="se__field">
      <label class="se__label">Título de la página</label>
      <input
        class="se__input"
        type="text"
        :value="seo.title"
        placeholder="Juan Pérez — Desarrollador Full Stack"
        @input="set('title', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div class="se__field">
      <label class="se__label">Descripción meta</label>
      <textarea
        class="se__input se__textarea"
        :value="seo.description"
        placeholder="Breve descripción para buscadores (max 160 caracteres)"
        rows="3"
        maxlength="160"
        @input="set('description', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>
    <div class="se__field">
      <label class="se__label">Imagen Open Graph (URL)</label>
      <input
        class="se__input"
        type="text"
        :value="seo.ogImageUrl"
        placeholder="https://..."
        @input="set('ogImageUrl', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<style scoped>
.se {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.se__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.se__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.se__input {
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  padding: 7px 10px;
  font-size: 12px;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
}
.se__input:focus {
  border-color: var(--color-primary);
}
.se__textarea {
  resize: vertical;
  min-height: 70px;
}
</style>
