<script setup lang="ts">
import { ref } from 'vue'
import { portfolioApi } from '@/api/portfolio/portfolio.api'

const props = defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()

const form = ref({ name: '', email: '', subject: '', message: '' })
const loading = ref(false)
const success = ref(false)
const error = ref('')

async function submit() {
  if (!form.value.name || !form.value.email || !form.value.message) return
  loading.value = true
  error.value = ''
  try {
    await portfolioApi.submitContact(props.portfolioData.profile.slug, form.value)
    success.value = true
    form.value = { name: '', email: '', subject: '', message: '' }
  } catch {
    error.value = 'Hubo un error al enviar el mensaje. Intentá de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section id="contacto" class="contact">
    <div class="contact__inner">
      <div class="contact__header">
        <h2 class="section-title">{{ content.title || '¿Trabajamos juntos?' }}</h2>
        <p v-if="content.subtitle" class="contact__subtitle">{{ content.subtitle }}</p>
      </div>
      <div v-if="success" class="contact__success">
        <span class="mdi mdi-check-circle-outline"></span>
        <p>Mensaje enviado. Te respondo pronto.</p>
      </div>
      <form v-else class="contact__form" @submit.prevent="submit">
        <div class="contact__row">
          <div class="contact__field">
            <label class="contact__label">Nombre *</label>
            <input class="contact__input" v-model="form.name" required placeholder="Tu nombre" />
          </div>
          <div class="contact__field">
            <label class="contact__label">Email *</label>
            <input class="contact__input" v-model="form.email" type="email" required placeholder="tu@email.com" />
          </div>
        </div>
        <div class="contact__field">
          <label class="contact__label">Asunto</label>
          <input class="contact__input" v-model="form.subject" placeholder="¿En qué puedo ayudarte?" />
        </div>
        <div class="contact__field">
          <label class="contact__label">Mensaje *</label>
          <textarea class="contact__input contact__textarea" v-model="form.message" required rows="5" placeholder="Contáme sobre tu proyecto..."></textarea>
        </div>
        <p v-if="error" class="contact__error">{{ error }}</p>
        <button type="submit" class="contact__btn" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar mensaje' }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.contact { padding: 80px 24px; }
.contact__inner { max-width: 720px; margin: 0 auto; }
.contact__header { margin-bottom: 40px; }
.contact__subtitle { color: var(--color-text-muted); font-size: 16px; margin: 8px 0 0; }
.contact__form { display: flex; flex-direction: column; gap: 16px; }
.contact__row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 600px) { .contact__row { grid-template-columns: 1fr; } }
.contact__field { display: flex; flex-direction: column; gap: 6px; }
.contact__label { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-text-muted); }
.contact__input { background: var(--color-bg-surface); border: 1px solid var(--color-border); color: var(--color-text-base); padding: 10px 14px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s; }
.contact__input:focus { border-color: var(--pf-primary, var(--color-primary)); }
.contact__textarea { resize: vertical; min-height: 120px; }
.contact__btn { padding: 12px 32px; background: var(--pf-primary, var(--color-primary)); color: #fff; border: none; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: opacity 0.15s; align-self: flex-start; }
.contact__btn:hover { opacity: 0.85; }
.contact__btn:disabled { opacity: 0.6; cursor: not-allowed; }
.contact__error { color: var(--color-error); font-size: 13px; margin: 0; }
.contact__success { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; text-align: center; color: var(--color-success); font-size: 42px; }
.contact__success p { font-size: 16px; color: var(--color-text-base); margin: 0; }
.section-title { font-size: 28px; font-weight: 700; margin: 0; }
</style>
