<template>
  <div class="quick-add-block">
    <input
      ref="inputRef"
      v-model="title"
      class="quick-add-block__input"
      :placeholder="`Nuevo bloque a las ${time}...`"
      @keydown.enter="submit"
      @keydown.esc="$emit('cancel')"
    />
    <button class="quick-add-block__btn" @click="submit">
      <span class="material-symbols-outlined">add</span>
    </button>
    <button class="quick-add-block__cancel" @click="$emit('cancel')">
      <span class="material-symbols-outlined">close</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, onMounted } from 'vue'
import { usePlannerBlocksStore } from '@/stores/planner-blocks.store'

export default defineComponent({
  name: 'QuickAddBlock',
  props: {
    date: { type: String, required: true },
    time: { type: String, default: '09:00' },
  },
  emits: ['cancel', 'created'],
  setup(props, { emit }) {
    const blocksStore = usePlannerBlocksStore()
    const inputRef = ref<HTMLInputElement | null>(null)
    const title = ref('')

    onMounted(async () => {
      await nextTick()
      inputRef.value?.focus()
    })

    async function submit() {
      const t = title.value.trim()
      if (!t) return

      const [h, m] = props.time.split(':').map(Number)
      const endHour = Math.min(h + 1, 23)
      const endTime = `${String(endHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`

      const block = await blocksStore.create({
        date: props.date,
        startTime: props.time,
        endTime,
        title: t,
      })
      title.value = ''
      emit('created', block)
    }

    return { inputRef, title, submit }
  },
})
</script>

<style scoped>
.quick-add-block {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--color-primary-fixed);
  border: 1px solid var(--color-primary);
  margin: 2px 8px;
}

.quick-add-block__input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text-base);
  font-size: 13px;
  font-family: var(--font-body);
}

.quick-add-block__input::placeholder { color: var(--color-text-disabled); }

.quick-add-block__btn,
.quick-add-block__cancel {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  padding: 2px;
  transition: color 0.15s;
}

.quick-add-block__btn:hover { color: var(--color-primary); }
.quick-add-block__cancel:hover { color: var(--color-error); }
.quick-add-block__btn .material-symbols-outlined,
.quick-add-block__cancel .material-symbols-outlined { font-size: 18px; }
</style>
