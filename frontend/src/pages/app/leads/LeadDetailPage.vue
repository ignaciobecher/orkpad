<template>
  <div class="lead-detail-page" v-if="selected">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <div class="header-info">
        <h1 class="page-title">{{ selected.name }}</h1>
        <span class="lead-source">{{ sourceLabel }}</span>
      </div>
      <div class="header-actions">
        <select v-model="statusValue" class="status-select" @change="updateStatus" :style="{ borderColor: getStatusColor(selected.status) }">
          <option value="new">Nuevo</option>
          <option value="contacted">Contactado</option>
          <option value="qualified">Calificado</option>
          <option value="disqualified">Descartado</option>
          <option value="converted">Convertido</option>
        </select>
      </div>
    </header>

    <div class="detail-grid">
      <!-- Score & Opportunities -->
      <w-card class="score-card">
        <div class="score-section">
          <div class="score-circle" :style="{ borderColor: getScoreColor(selected.score) }">
            <span class="score-value">{{ selected.score }}</span>
            <span class="score-label">SCORE</span>
          </div>
          <div class="opportunities-list">
            <p class="section-label">Oportunidades detectadas</p>
            <div v-if="selected.opportunities.length === 0" class="no-opportunities">
              Sin oportunidades claras detectadas
            </div>
            <div v-for="opp in selected.opportunities" :key="opp" class="opportunity-item">
              <span class="material-symbols-outlined opp-icon">{{ getOpportunityIcon(opp) }}</span>
              <span>{{ getOpportunityDescription(opp) }}</span>
            </div>
          </div>
        </div>
      </w-card>

      <!-- Contact Info -->
      <w-card>
        <p class="card-section-title">Información de contacto</p>
        <div class="info-rows">
          <div class="info-row" v-if="selected.phone">
            <span class="material-symbols-outlined info-icon">call</span>
            <a :href="'tel:' + selected.phone" class="info-value link">{{ selected.phone }}</a>
          </div>
          <div class="info-row" v-if="selected.whatsapp">
            <span class="material-symbols-outlined info-icon">chat</span>
            <a :href="'https://wa.me/' + selected.whatsapp.replace(/\D/g,'')" target="_blank" class="info-value link">{{ selected.whatsapp }}</a>
          </div>
          <div class="info-row" v-if="selected.email">
            <span class="material-symbols-outlined info-icon">mail</span>
            <a :href="'mailto:' + selected.email" class="info-value link">{{ selected.email }}</a>
            <span v-if="selected.emailSource" class="email-origin-badge" :title="getEmailSourceLabel(selected.emailSource)">
              {{ getEmailSourceIcon(selected.emailSource) }}
            </span>
            <span
              v-if="selected.emailConfidence"
              class="email-confidence-dot"
              :style="{ background: getEmailConfidenceColor(selected.emailConfidence) }"
              :title="'Confianza: ' + selected.emailConfidence"
            ></span>
            <button class="copy-btn" @click="copyEmail" title="Copiar email">
              <span class="material-symbols-outlined">content_copy</span>
            </button>
          </div>
          <div class="info-row harvest-row" v-if="!selected.email && selected.website">
            <span class="material-symbols-outlined info-icon">search</span>
            <button class="harvest-btn" @click="harvestEmail" :disabled="harvesting">
              <span v-if="harvesting" class="material-symbols-outlined spinning">sync</span>
              <span v-else class="material-symbols-outlined">travel_explore</span>
              {{ harvesting ? 'Buscando...' : 'Buscar emails en este sitio' }}
            </button>
          </div>
          <div class="info-row" v-if="selected.website">
            <span class="material-symbols-outlined info-icon">language</span>
            <a :href="selected.website" target="_blank" class="info-value link">{{ selected.website }}</a>
          </div>
          <div class="info-row" v-if="selected.instagram">
            <span class="material-symbols-outlined info-icon">photo_camera</span>
            <span class="info-value">{{ selected.instagram }}</span>
          </div>
          <div class="info-row" v-if="selected.facebook">
            <span class="material-symbols-outlined info-icon">thumb_up</span>
            <a :href="selected.facebook" target="_blank" class="info-value link">Facebook</a>
          </div>
          <div v-if="!selected.phone && !selected.email && !selected.website" class="empty-section">
            Sin datos de contacto
          </div>
        </div>
      </w-card>

      <!-- Location -->
      <w-card>
        <p class="card-section-title">Ubicación</p>
        <div class="info-rows">
          <div class="info-row" v-if="selected.address">
            <span class="material-symbols-outlined info-icon">location_on</span>
            <span class="info-value">{{ selected.address }}</span>
          </div>
          <div class="info-row" v-if="selected.city || selected.province">
            <span class="material-symbols-outlined info-icon">map</span>
            <span class="info-value">{{ [selected.city, selected.province, selected.country].filter(Boolean).join(', ') }}</span>
          </div>
        </div>
      </w-card>

      <!-- Notes -->
      <w-card class="notes-card">
        <p class="card-section-title">Notas</p>
        <textarea
          v-model="notesValue"
          class="notes-textarea"
          placeholder="Agregar notas sobre este lead..."
          @blur="saveNotes"
          rows="5"
        ></textarea>
      </w-card>
    </div>
  </div>

  <div v-else-if="loading" class="loading-state">
    <w-loading-skeleton />
  </div>

  <div v-else class="empty-state">
    <w-empty-state message="Lead no encontrado" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useLeadsStore } from '@/stores/leads.store'
import WCard from '@/components/ui/WCard.vue'
import WLoadingSkeleton from '@/components/ui/WLoadingSkeleton.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'

export default defineComponent({
  name: 'LeadDetailPage',
  components: { WCard, WLoadingSkeleton, WEmptyState },
  data() {
    return {
      statusValue: 'new' as string,
      notesValue: '' as string,
    }
  },
  computed: {
    ...mapState(useLeadsStore, ['selected', 'loading', 'harvesting']),
    sourceLabel(): string {
      const map: Record<string, string> = {
        web: 'Web',
        manual: 'Manual',
        import: 'Importado',
      }
      return map[this.selected?.source ?? ''] ?? ''
    },
  },
  methods: {
    ...mapActions(useLeadsStore, ['fetchById', 'update', 'harvestEmail as storeHarvestEmail']),
    async updateStatus() {
      if (this.selected) {
        await this.update(this.selected._id, { status: this.statusValue as any })
      }
    },
    async saveNotes() {
      if (this.selected && this.notesValue !== (this.selected.notes ?? '')) {
        await this.update(this.selected._id, { notes: this.notesValue })
      }
    },
    async harvestEmail() {
      if (this.selected) {
        await this.storeHarvestEmail(this.selected._id)
      }
    },
    async copyEmail() {
      if (this.selected?.email) {
        await navigator.clipboard.writeText(this.selected.email)
      }
    },
    getScoreColor(score: number) {
      if (score >= 60) return 'var(--color-success)'
      if (score >= 30) return 'var(--color-warning)'
      return 'var(--color-text-muted)'
    },
    getStatusColor(status: string) {
      const map: Record<string, string> = {
        new: 'var(--color-primary)',
        contacted: 'var(--color-warning)',
        qualified: 'var(--color-success)',
        disqualified: 'var(--color-text-muted)',
        converted: '#10b981',
      }
      return map[status] ?? 'var(--color-text-muted)'
    },
    getOpportunityIcon(opp: string) {
      const map: Record<string, string> = {
        no_website: 'web_asset_off',
        bad_seo: 'search_off',
        no_social: 'person_off',
        no_https: 'lock_open',
        outdated_web: 'history',
        no_email: 'mail_off',
      }
      return map[opp] ?? 'warning'
    },
    getOpportunityDescription(opp: string) {
      const map: Record<string, string> = {
        no_website: 'No tiene sitio web — gran oportunidad',
        bad_seo: 'SEO deficiente en su sitio web',
        no_social: 'Sin presencia en redes sociales',
        no_https: 'Sitio web sin certificado SSL',
        outdated_web: 'Sitio web desactualizado',
        no_email: 'No se encontró un email de contacto',
      }
      return map[opp] ?? opp
    },
    getEmailSourceIcon(source: string) {
      const map: Record<string, string> = {
        homepage: '🏠',
        contact_page: '📄',
        about_page: 'ℹ️',
        inferred: '✨',
        manual: '✏️',
      }
      return map[source] ?? '📧'
    },
    getEmailSourceLabel(source: string) {
      const map: Record<string, string> = {
        homepage: 'Extraído de la homepage',
        contact_page: 'Extraído de página de contacto',
        about_page: 'Extraído de página about',
        inferred: 'Inferido por patrón',
        manual: 'Cargado manualmente',
      }
      return map[source] ?? source
    },
    getEmailConfidenceColor(confidence: string) {
      const map: Record<string, string> = {
        high: 'var(--color-success)',
        medium: 'var(--color-warning)',
        low: 'var(--color-error)',
      }
      return map[confidence] ?? 'var(--color-text-muted)'
    },
  },
  watch: {
    selected(val) {
      if (val) {
        this.statusValue = val.status
        this.notesValue = val.notes ?? ''
      }
    },
  },
  mounted() {
    const id = this.$route.params.id as string
    this.fetchById(id)
  },
})
</script>

<style scoped>
.lead-detail-page {
  padding: 32px;
  flex-grow: 1;
  min-width: 0;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.back-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 4px;
}
.back-btn:hover { color: var(--color-text-base); }

.header-info { flex: 1; }
.page-title { font-size: 22px; font-weight: 600; color: var(--color-text-base); }
.lead-source { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); }

.status-select {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-width: 2px;
  padding: 6px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  outline: none;
  cursor: pointer;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.notes-card { grid-column: 1 / -1; }

.score-section { display: flex; gap: 24px; align-items: flex-start; }
.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.score-value { font-size: 24px; font-weight: 700; color: var(--color-text-base); line-height: 1; }
.score-label { font-family: var(--font-mono); font-size: 9px; color: var(--color-text-muted); }

.section-label { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); margin-bottom: 8px; }
.no-opportunities { font-size: 12px; color: var(--color-text-muted); }
.opportunity-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-base);
  margin-bottom: 6px;
}
.opp-icon { font-size: 16px; color: var(--color-warning); }

.card-section-title {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-rows { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; align-items: center; gap: 10px; }
.info-icon { font-size: 16px; color: var(--color-text-muted); flex-shrink: 0; }
.info-value { font-size: 13px; color: var(--color-text-base); }
.link { color: var(--color-primary); text-decoration: none; }
.link:hover { text-decoration: underline; }

.empty-section { font-size: 12px; color: var(--color-text-muted); }

.email-origin-badge { font-size: 14px; flex-shrink: 0; }
.email-confidence-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.copy-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 2px;
  margin-left: auto;
}
.copy-btn:hover { color: var(--color-text-base); }
.copy-btn span { font-size: 14px; }

.harvest-row { margin-top: 4px; }
.harvest-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 6px 12px;
  cursor: pointer;
}
.harvest-btn:hover:not(:disabled) { background: var(--color-primary); color: white; }
.harvest-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.harvest-btn span { font-size: 14px; }

@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinning { display: inline-block; animation: spin 1s linear infinite; }

.notes-textarea {
  width: 100%;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-size: 13px;
  font-family: var(--font-body);
  padding: 10px 12px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.loading-state, .empty-state {
  padding: 32px;
  display: flex;
  justify-content: center;
}
</style>
