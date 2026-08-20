<template>
  <div class="prospecting-tab">
    <div v-if="!editing" class="prospecting-view">
      <div class="field-block">
        <span class="field-label">Meta semanal</span>
        <div class="progress-bar">
          <div class="progress-bar__fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="progress-text">{{ currentWeekMessages }} / {{ account.prospecting?.weeklyGoal || 0 }} mensajes esta semana</span>
      </div>

      <div class="field-block">
        <span class="field-label">Industrias objetivo</span>
        <div class="badge-list">
          <w-badge v-for="(i, idx) in account.prospecting?.targetIndustries" :key="idx">{{ i }}</w-badge>
        </div>
      </div>

      <div class="field-block">
        <span class="field-label">Roles objetivo</span>
        <div class="badge-list">
          <w-badge v-for="(r, idx) in account.prospecting?.targetRoles" :key="idx" color="var(--color-text-muted)">{{ r }}</w-badge>
        </div>
      </div>

      <div class="list-columns">
        <div class="list-block">
          <span class="field-label">Criterios de calificación</span>
          <ul class="bullet-list">
            <li v-for="(c, i) in account.prospecting?.qualificationCriteria" :key="i">{{ c }}</li>
          </ul>
        </div>
        <div class="list-block">
          <span class="field-label">Criterios de descalificación</span>
          <ul class="bullet-list bullet-list--negative">
            <li v-for="(c, i) in account.prospecting?.disqualificationCriteria" :key="i">{{ c }}</li>
          </ul>
        </div>
      </div>

      <div class="field-block">
        <span class="field-label">Estrategia de búsqueda</span>
        <p class="field-value">{{ account.prospecting?.searchStrategy || '—' }}</p>
      </div>

      <div class="field-block">
        <span class="field-label">Meta de conversión</span>
        <p class="field-value">{{ account.prospecting?.conversionGoal || '—' }}</p>
      </div>

      <w-button variant="secondary" @click="startEdit">Editar prospección</w-button>
    </div>

    <form v-else class="prospecting-form" @submit.prevent>
      <div class="form-group">
        <label>Meta semanal</label>
        <input v-model.number="form.weeklyGoal" type="number" min="0" />
      </div>
      <div class="form-group">
        <label>Industrias objetivo</label>
        <tag-input v-model="form.targetIndustries" placeholder="+ industria" />
      </div>
      <div class="form-group">
        <label>Roles objetivo</label>
        <tag-input v-model="form.targetRoles" placeholder="+ rol" />
      </div>
      <div class="form-group">
        <label>Ciudades objetivo</label>
        <tag-input v-model="form.targetCities" placeholder="+ ciudad" />
      </div>
      <div class="form-group">
        <label>Criterios de calificación</label>
        <tag-input v-model="form.qualificationCriteria" placeholder="+ criterio" />
      </div>
      <div class="form-group">
        <label>Criterios de descalificación</label>
        <tag-input v-model="form.disqualificationCriteria" placeholder="+ criterio" />
      </div>
      <div class="form-group">
        <label>Estrategia de búsqueda</label>
        <textarea v-model="form.searchStrategy" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>Meta de conversión</label>
        <input v-model="form.conversionGoal" type="text" />
      </div>

      <div class="form-actions">
        <w-button variant="secondary" @click="editing = false">Cancelar</w-button>
        <w-button variant="primary" @click="handleSave">Guardar</w-button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue'
import WButton from '@/components/ui/WButton.vue'
import WBadge from '@/components/ui/WBadge.vue'
import TagInput from '@/components/social-identity/TagInput.vue'
import type { SocialAccount } from '@/api/social-identity/social-identity.types'

function buildForm(account: SocialAccount) {
  return {
    weeklyGoal: account.prospecting?.weeklyGoal || 0,
    targetIndustries: [...(account.prospecting?.targetIndustries || [])],
    targetRoles: [...(account.prospecting?.targetRoles || [])],
    targetCities: [...(account.prospecting?.targetCities || [])],
    qualificationCriteria: [...(account.prospecting?.qualificationCriteria || [])],
    disqualificationCriteria: [...(account.prospecting?.disqualificationCriteria || [])],
    searchStrategy: account.prospecting?.searchStrategy || '',
    conversionGoal: account.prospecting?.conversionGoal || '',
  }
}

export default defineComponent({
  name: 'ProspectingTab',
  components: { WButton, WBadge, TagInput },
  props: {
    account: { type: Object as PropType<SocialAccount>, required: true },
  },
  emits: ['save'],
  setup(props, { emit }) {
    const editing = ref(false)
    const form = ref(buildForm(props.account))

    const currentWeekMessages = computed(() => {
      const last = props.account.weeklyMetrics?.slice(-1)[0]
      return last?.messagesSent || 0
    })

    const progressPercent = computed(() => {
      const goal = props.account.prospecting?.weeklyGoal || 0
      if (!goal) return 0
      return Math.min(100, Math.round((currentWeekMessages.value / goal) * 100))
    })

    function startEdit() {
      form.value = buildForm(props.account)
      editing.value = true
    }

    function handleSave() {
      emit('save', { prospecting: { ...form.value } })
      editing.value = false
    }

    return { editing, form, currentWeekMessages, progressPercent, startEdit, handleSave }
  },
})
</script>

<style scoped>
.prospecting-tab { display: flex; flex-direction: column; gap: 20px; max-width: 640px; }

.prospecting-view { display: flex; flex-direction: column; gap: 16px; }
.field-block, .list-block { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.field-value { font-family: var(--font-body); font-size: 13px; color: var(--color-text-base); margin: 0; }

.progress-bar { width: 100%; height: 8px; background: var(--color-bg-surface-low); border-radius: 4px; overflow: hidden; }
.progress-bar__fill { height: 100%; background: var(--color-primary); transition: width 0.3s; }
.progress-text { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }

.badge-list { display: flex; gap: 6px; flex-wrap: wrap; }

.list-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.bullet-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.bullet-list li { font-family: var(--font-body); font-size: 13px; color: var(--color-text-base); padding-left: 14px; position: relative; }
.bullet-list li::before { content: '•'; position: absolute; left: 0; color: var(--color-primary); }
.bullet-list--negative li::before { color: var(--color-error); }

.prospecting-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.form-group input,
.form-group textarea {
  background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
  color: var(--color-text-base); font-family: var(--font-body); font-size: 13px;
  padding: 10px 12px; outline: none; border-radius: 4px; width: 100%;
}
.form-group input:focus,
.form-group textarea:focus { border-color: var(--color-border-focus); }

.form-actions { display: flex; gap: 12px; }

@media (max-width: 540px) {
  .list-columns { grid-template-columns: 1fr; }
}
</style>
