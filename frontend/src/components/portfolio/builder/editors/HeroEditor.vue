<script setup lang="ts">
defineProps<{ content: Record<string, any>; settings: Record<string, any> }>()
const emit = defineEmits<{
  'update-content': [v: Record<string, any>]
  'update-settings': [v: Record<string, any>]
}>()
const c = (k: string, v: any) => emit('update-content', { [k]: v })
const s = (k: string, v: any) => emit('update-settings', { [k]: v })
</script>

<template>
  <div class="ed">
    <div class="ed__group">
      <label class="ed__label">Fuente de datos</label>
      <label class="ed__toggle">
        <input
          type="checkbox"
          :checked="content.useWorkspaceData !== false"
          @change="c('useWorkspaceData', ($event.target as HTMLInputElement).checked)"
        />
        <span>Usar datos del workspace automáticamente</span>
      </label>
    </div>

    <template v-if="!content.useWorkspaceData">
      <div class="ed__group">
        <label class="ed__label">Nombre</label>
        <input class="ed__input" :value="content.customName" @input="c('customName', ($event.target as HTMLInputElement).value)" placeholder="Tu nombre completo" />
      </div>
      <div class="ed__group">
        <label class="ed__label">Titular</label>
        <input class="ed__input" :value="content.customHeadline" @input="c('customHeadline', ($event.target as HTMLInputElement).value)" placeholder="Desarrollador Full Stack" />
      </div>
      <div class="ed__group">
        <label class="ed__label">Bio corta</label>
        <textarea class="ed__input ed__textarea" :value="content.customBio" @input="c('customBio', ($event.target as HTMLTextAreaElement).value)" rows="3" placeholder="Descripción breve sobre ti..."></textarea>
      </div>
    </template>

    <div class="ed__group">
      <label class="ed__label">Botón CTA — Texto</label>
      <input class="ed__input" :value="content.ctaLabel" @input="c('ctaLabel', ($event.target as HTMLInputElement).value)" placeholder="Contáctame" />
    </div>
    <div class="ed__group">
      <label class="ed__label">Botón CTA — URL</label>
      <input class="ed__input" :value="content.ctaUrl" @input="c('ctaUrl', ($event.target as HTMLInputElement).value)" placeholder="#contacto o https://..." />
    </div>

    <div class="ed__group">
      <label class="ed__toggle">
        <input type="checkbox" :checked="content.showSocialLinks" @change="c('showSocialLinks', ($event.target as HTMLInputElement).checked)" />
        <span>Mostrar links sociales</span>
      </label>
    </div>
    <div class="ed__group">
      <label class="ed__toggle">
        <input type="checkbox" :checked="content.showAvailability" @change="c('showAvailability', ($event.target as HTMLInputElement).checked)" />
        <span>Mostrar disponibilidad</span>
      </label>
    </div>

    <div class="ed__divider"></div>
    <div class="ed__group">
      <label class="ed__label">Layout</label>
      <select class="ed__input" :value="settings.layout" @change="s('layout', ($event.target as HTMLSelectElement).value)">
        <option value="centered">Centrado</option>
        <option value="left">Alineado a la izquierda</option>
        <option value="split">Split (imagen / texto)</option>
      </select>
    </div>
    <div class="ed__group">
      <label class="ed__toggle">
        <input type="checkbox" :checked="settings.showBanner" @change="s('showBanner', ($event.target as HTMLInputElement).checked)" />
        <span>Mostrar banner de fondo</span>
      </label>
    </div>
  </div>
</template>

<style scoped src="./editor.css"></style>
