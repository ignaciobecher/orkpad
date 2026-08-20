<template>
  <div class="pe">
    <div class="pe__group">
      <label class="pe__label">Titular (headline)</label>
      <input class="pe__input" v-model="form.headline" placeholder="Ej: Diseñador web freelance" />
    </div>
    <div class="pe__group">
      <label class="pe__label">Bio (descripción)</label>
      <textarea class="pe__textarea" v-model="form.bio" rows="4" maxlength="500" placeholder="Contá quién sos y qué hacés..."></textarea>
      <p class="pe__char-count">{{ (form.bio || '').length }}/500</p>
    </div>
    <div class="pe__group">
      <label class="pe__label">URL de avatar</label>
      <input class="pe__input" v-model="form.avatarUrl" placeholder="https://..." />
    </div>
    <div class="pe__group">
      <label class="pe__label">URL de banner</label>
      <input class="pe__input" v-model="form.bannerUrl" placeholder="https://..." />
    </div>

    <div class="pe__divider"></div>
    <p class="pe__section-title">Redes sociales</p>
    <div class="pe__group">
      <label class="pe__label">Sitio web</label>
      <input class="pe__input" v-model="form.socialLinks.website" placeholder="https://tusitio.com" />
    </div>
    <div class="pe__group">
      <label class="pe__label">LinkedIn</label>
      <input class="pe__input" v-model="form.socialLinks.linkedin" placeholder="https://linkedin.com/in/..." />
    </div>
    <div class="pe__group">
      <label class="pe__label">Twitter / X</label>
      <input class="pe__input" v-model="form.socialLinks.twitter" placeholder="https://twitter.com/..." />
    </div>
    <div class="pe__group">
      <label class="pe__label">GitHub</label>
      <input class="pe__input" v-model="form.socialLinks.github" placeholder="https://github.com/..." />
    </div>

    <div class="pe__divider"></div>
    <p class="pe__section-title">Habilidades</p>
    <div class="pe__skills-wrap">
      <span v-for="(skill, i) in form.skills" :key="i" class="pe__skill-chip">
        {{ skill }}
        <button class="pe__skill-remove" @click="removeSkill(i)">×</button>
      </span>
      <input
        v-model="skillInput"
        class="pe__skill-input"
        placeholder="Ej: React (Enter para agregar)"
        @keydown="handleSkillKeydown"
      />
    </div>

    <div class="pe__divider"></div>
    <p class="pe__section-title">Disponibilidad</p>
    <div class="pe__toggle-row">
      <span class="pe__toggle-label">Disponible para proyectos</span>
      <label class="pe__toggle">
        <input type="checkbox" v-model="form.availableForWork" />
        <span class="pe__toggle-slider"></span>
      </label>
    </div>
    <div v-if="form.availableForWork" class="pe__group" style="margin-top:8px">
      <label class="pe__label">Nota de disponibilidad</label>
      <input class="pe__input" v-model="form.availabilityNote" placeholder="Ej: Disponible desde julio" />
    </div>

    <div class="pe__divider"></div>
    <p class="pe__section-title">Estadísticas</p>
    <div class="pe__stats-grid">
      <div class="pe__group">
        <label class="pe__label">Años exp.</label>
        <input class="pe__input" type="number" v-model.number="form.portfolioStats.yearsExperience" placeholder="0" />
      </div>
      <div class="pe__group">
        <label class="pe__label">Proyectos</label>
        <input class="pe__input" type="number" v-model.number="form.portfolioStats.completedProjects" placeholder="0" />
      </div>
      <div class="pe__group">
        <label class="pe__label">Clientes</label>
        <input class="pe__input" type="number" v-model.number="form.portfolioStats.happyClients" placeholder="0" />
      </div>
    </div>

    <button class="pe__save-btn" :disabled="saving" @click="save">
      <span v-if="saving" class="mdi mdi-loading mdi-spin"></span>
      <span v-else class="mdi mdi-content-save-outline"></span>
      {{ saving ? 'Guardando...' : 'Guardar perfil' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { workspacesApi } from '@/api/workspaces/workspaces.api'
import { useToast } from '@/composables/useToast'
import type { Workspace } from '@/api/workspaces/workspaces.types'

const props = defineProps<{ workspace: Workspace }>()
const emit = defineEmits<{ saved: [workspace: Workspace] }>()

const saving = ref(false)
const skillInput = ref('')

const form = ref({
  headline: props.workspace.headline || '',
  bio: props.workspace.bio || '',
  avatarUrl: props.workspace.avatarUrl || '',
  bannerUrl: props.workspace.bannerUrl || '',
  socialLinks: {
    website: props.workspace.socialLinks?.website || '',
    linkedin: props.workspace.socialLinks?.linkedin || '',
    twitter: props.workspace.socialLinks?.twitter || '',
    github: props.workspace.socialLinks?.github || '',
  },
  skills: [...(props.workspace.skills || [])],
  availableForWork: props.workspace.availableForWork || false,
  availabilityNote: props.workspace.availabilityNote || '',
  portfolioStats: {
    yearsExperience: props.workspace.portfolioStats?.yearsExperience ?? null,
    completedProjects: props.workspace.portfolioStats?.completedProjects ?? null,
    happyClients: props.workspace.portfolioStats?.happyClients ?? null,
  },
})

watch(() => props.workspace, (ws) => {
  form.value.headline = ws.headline || ''
  form.value.bio = ws.bio || ''
  form.value.avatarUrl = ws.avatarUrl || ''
  form.value.bannerUrl = ws.bannerUrl || ''
  form.value.socialLinks = {
    website: ws.socialLinks?.website || '',
    linkedin: ws.socialLinks?.linkedin || '',
    twitter: ws.socialLinks?.twitter || '',
    github: ws.socialLinks?.github || '',
  }
  form.value.skills = [...(ws.skills || [])]
  form.value.availableForWork = ws.availableForWork || false
  form.value.availabilityNote = ws.availabilityNote || ''
  form.value.portfolioStats = {
    yearsExperience: ws.portfolioStats?.yearsExperience ?? null,
    completedProjects: ws.portfolioStats?.completedProjects ?? null,
    happyClients: ws.portfolioStats?.happyClients ?? null,
  }
})

function addSkill() {
  const skill = skillInput.value.trim()
  if (skill && !form.value.skills.includes(skill)) {
    form.value.skills.push(skill)
  }
  skillInput.value = ''
}

function handleSkillKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addSkill()
  }
}

function removeSkill(index: number) {
  form.value.skills.splice(index, 1)
}

async function save() {
  saving.value = true
  try {
    const { data } = await workspacesApi.updateMe({
      headline: form.value.headline || undefined,
      bio: form.value.bio || undefined,
      avatarUrl: form.value.avatarUrl || undefined,
      bannerUrl: form.value.bannerUrl || undefined,
      socialLinks: {
        website: form.value.socialLinks.website || undefined,
        linkedin: form.value.socialLinks.linkedin || undefined,
        twitter: form.value.socialLinks.twitter || undefined,
        github: form.value.socialLinks.github || undefined,
      },
      skills: form.value.skills,
      availableForWork: form.value.availableForWork,
      availabilityNote: form.value.availabilityNote || undefined,
      portfolioStats: {
        yearsExperience: form.value.portfolioStats.yearsExperience ?? undefined,
        completedProjects: form.value.portfolioStats.completedProjects ?? undefined,
        happyClients: form.value.portfolioStats.happyClients ?? undefined,
      },
    })
    useToast().success('Perfil actualizado')
    emit('saved', data)
  } catch {
    useToast().error('Error al guardar el perfil')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.pe { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.pe__group { display: flex; flex-direction: column; gap: 4px; }
.pe__label { font-size: 11px; font-weight: 500; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.pe__input { padding: 7px 10px; border: 1px solid var(--color-border); background: var(--color-bg-surface-low); color: var(--color-text-base); font-size: 13px; font-family: var(--font-body); width: 100%; box-sizing: border-box; }
.pe__input:focus { outline: none; border-color: var(--color-primary); }
.pe__textarea { padding: 7px 10px; border: 1px solid var(--color-border); background: var(--color-bg-surface-low); color: var(--color-text-base); font-size: 13px; font-family: var(--font-body); width: 100%; box-sizing: border-box; resize: vertical; }
.pe__textarea:focus { outline: none; border-color: var(--color-primary); }
.pe__char-count { font-size: 11px; color: var(--color-text-muted); text-align: right; }
.pe__divider { height: 1px; background: var(--color-border); margin: 4px 0; }
.pe__section-title { font-size: 11px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin: 0; }
.pe__stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.pe__skills-wrap { display: flex; flex-wrap: wrap; gap: 5px; padding: 7px 8px; border: 1px solid var(--color-border); background: var(--color-bg-surface-low); min-height: 38px; align-items: center; }
.pe__skill-chip { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; background: rgba(37,99,235,0.12); color: var(--color-primary); font-size: 11px; font-family: var(--font-mono); border: 1px solid rgba(37,99,235,0.25); }
.pe__skill-remove { background: none; border: none; cursor: pointer; color: var(--color-primary); font-size: 13px; padding: 0; opacity: 0.7; line-height: 1; }
.pe__skill-remove:hover { opacity: 1; }
.pe__skill-input { border: none; outline: none; background: transparent; font-size: 12px; color: var(--color-text-base); min-width: 120px; flex: 1; font-family: var(--font-body); }
.pe__toggle-row { display: flex; justify-content: space-between; align-items: center; }
.pe__toggle-label { font-size: 13px; font-weight: 500; color: var(--color-text-base); }
.pe__toggle { position: relative; display: inline-block; width: 40px; height: 22px; }
.pe__toggle input { opacity: 0; width: 0; height: 0; }
.pe__toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--color-border); border-radius: 22px; transition: 0.2s; }
.pe__toggle-slider:before { position: absolute; content: ''; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
.pe__toggle input:checked + .pe__toggle-slider { background-color: var(--color-primary); }
.pe__toggle input:checked + .pe__toggle-slider:before { transform: translateX(18px); }
.pe__save-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 16px; background: var(--color-primary); color: white; border: none; font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; margin-top: 4px; }
.pe__save-btn:hover:not(:disabled) { opacity: 0.85; }
.pe__save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
