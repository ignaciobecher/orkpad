<template>
  <div class="support-faq">
    <div v-for="(item, index) in faqs" :key="index" class="support-faq__item">
      <button class="support-faq__question" @click="toggle(index)">
        <span>{{ item.question }}</span>
        <span class="material-symbols-outlined support-faq__icon" :class="{ open: openIndex === index }">
          expand_more
        </span>
      </button>
      <div v-if="openIndex === index" class="support-faq__answer">
        {{ item.answer }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

const faqs = [
  {
    question: '¿Cómo cambio mi plan?',
    answer: 'Podés cambiar tu plan desde Configuración > Suscripción. Los cambios se aplican en el próximo ciclo de facturación.',
  },
  {
    question: '¿Cómo invito a un miembro del equipo?',
    answer: 'Por el momento cada workspace tiene un único usuario. Estamos trabajando en soporte para equipos — escribinos si lo necesitás con urgencia.',
  },
  {
    question: '¿Dónde configuro mis notificaciones?',
    answer: 'Andá a Configuración > Notificaciones para elegir qué eventos te queremos avisar por email o push.',
  },
  {
    question: '¿Cómo cancelo mi suscripción?',
    answer: 'Desde Configuración > Suscripción tenés la opción de cancelar en cualquier momento, sin penalidades.',
  },
]

export default defineComponent({
  name: 'SupportFaqList',
  setup() {
    const openIndex = ref<number | null>(null)

    const toggle = (index: number) => {
      openIndex.value = openIndex.value === index ? null : index
    }

    return { faqs, openIndex, toggle }
  },
})
</script>

<style scoped>
.support-faq {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.support-faq__item {
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-surface-low);
}

.support-faq__question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  background: none;
  border: none;
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.support-faq__icon {
  font-size: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.support-faq__icon.open {
  transform: rotate(180deg);
}

.support-faq__answer {
  padding: 0 14px 14px 14px;
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.6;
}
</style>
