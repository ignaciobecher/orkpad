<template>
  <div class="prompt-card">
    <div class="prompt-card__header">
      <span class="prompt-card__name">{{ prompt.name }}</span>
      <w-badge :color="networkColor">{{ networkLabel }}</w-badge>
    </div>

    <p class="prompt-card__preview">{{ preview }}</p>

    <div class="prompt-card__meta">
      <span v-if="prompt.category" class="prompt-category">
        <span class="material-symbols-outlined">label</span>
        {{ prompt.category }}
      </span>
      <div v-if="prompt.tags?.length" class="prompt-card__tags">
        <span v-for="tag in prompt.tags" :key="tag" class="prompt-tag">#{{ tag }}</span>
      </div>
    </div>

    <div class="prompt-card__footer">
      <button class="action-btn" @click="copyPrompt">
        <span class="material-symbols-outlined">{{ copied ? 'check' : 'content_copy' }}</span>
        {{ copied ? 'Copiado' : 'Copiar' }}
      </button>
      <div class="footer-actions">
        <button class="action-btn" @click="$emit('edit', prompt)">
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button class="action-btn action-btn--danger" @click="$emit('remove', prompt)">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue'
import WBadge from '@/components/ui/WBadge.vue'
import { NETWORK_LABELS, NETWORK_COLORS } from '@/api/marketing/marketing-shared.types'
import type { MarketingPrompt } from '@/api/marketing/marketing-prompts.types'

export default defineComponent({
  name: 'PromptCard',
  components: { WBadge },
  props: {
    prompt: { type: Object as PropType<MarketingPrompt>, required: true },
  },
  emits: ['edit', 'remove'],
  setup(props) {
    const copied = ref(false)

    const networkLabel = computed(() =>
      props.prompt.network === 'general' ? 'General' : NETWORK_LABELS[props.prompt.network as keyof typeof NETWORK_LABELS],
    )
    const networkColor = computed(() =>
      props.prompt.network === 'general' ? 'var(--color-text-muted)' : NETWORK_COLORS[props.prompt.network as keyof typeof NETWORK_COLORS],
    )
    const preview = computed(() => {
      const text = props.prompt.promptText || ''
      return text.length > 160 ? `${text.slice(0, 160)}…` : text
    })

    async function copyPrompt() {
      try {
        await navigator.clipboard.writeText(props.prompt.promptText)
        copied.value = true
        setTimeout(() => { copied.value = false }, 1500)
      } catch {
        // clipboard not available — silently ignore
      }
    }

    return { copied, networkLabel, networkColor, preview, copyPrompt }
  },
})
</script>

<style scoped>
.prompt-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.15s;
}

.prompt-card:hover { border-color: var(--color-primary); }

.prompt-card__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.prompt-card__name { font-family: var(--font-body); font-size: 14px; font-weight: 600; color: var(--color-text-base); line-height: 1.4; }

.prompt-card__preview {
  font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted);
  margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}

.prompt-card__meta { display: flex; flex-direction: column; gap: 6px; }
.prompt-category { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--color-text-muted); }
.prompt-category .material-symbols-outlined { font-size: 14px; }
.prompt-card__tags { display: flex; flex-wrap: wrap; gap: 4px; }
.prompt-tag { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); background: var(--color-bg-surface-high); padding: 1px 6px; }

.prompt-card__footer {
  display: flex; align-items: center; justify-content: space-between; padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.footer-actions { display: flex; gap: 4px; }
.action-btn {
  display: flex; align-items: center; gap: 4px; background: none; border: none; color: var(--color-text-muted);
  cursor: pointer; padding: 4px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  transition: color 0.15s;
}
.action-btn:hover { color: var(--color-text-base); }
.action-btn--danger:hover { color: var(--color-error); }
.action-btn .material-symbols-outlined { font-size: 16px; }
</style>
