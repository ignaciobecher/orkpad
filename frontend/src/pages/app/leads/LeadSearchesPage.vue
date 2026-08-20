<template>
  <div class="lead-searches-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Búsqueda de Leads</h1>
        <p class="page-subtitle">Buscá potenciales clientes por rubro y zona — extraemos emails automáticamente desde la web</p>
      </div>
    </header>

    <!-- New Search Form -->
    <w-card class="search-form-card">
      <p class="form-section-title">Nueva búsqueda</p>
      <form @submit.prevent="submitSearch" class="search-form">
        <div class="form-row">
          <div class="form-group form-group--autocomplete">
            <label class="form-label">Rubro / Negocio *</label>
            <input
              v-model="form.query"
              class="form-input"
              placeholder="ej: ferreterías, restaurantes, abogados"
              @focus="activeSuggestions = 'query'"
              @blur="hideSuggestions"
              required
            />
            <div v-if="activeSuggestions === 'query' && filteredRubros && filteredRubros.length > 0" class="suggestions-dropdown">
              <button
                v-for="r in filteredRubros"
                :key="r"
                type="button"
                class="suggestion-item"
                @mousedown.prevent="selectRubro(r)"
              >
                <span class="material-symbols-outlined suggestion-icon">storefront</span>
                {{ r }}
              </button>
            </div>
            <div class="chips-row">
              <button
                v-for="r in popularRubros"
                :key="r"
                type="button"
                class="chip"
                :class="{ 'chip--active': form.query === r }"
                @click="selectRubro(r)"
              >{{ r }}</button>
            </div>
          </div>
          <div class="form-group form-group--autocomplete">
            <label class="form-label">Ubicación *</label>
            <input
              v-model="form.location"
              class="form-input"
              placeholder="ej: Villa Mercedes, San Luis"
              @focus="activeSuggestions = 'location'"
              @blur="hideSuggestions"
              @input="onLocationInput"
              required
            />
            <span v-if="citiesLoading" class="autocomplete-spinner">
              <span class="material-symbols-outlined spinning">sync</span>
            </span>
            <div v-if="activeSuggestions === 'location' && citySuggestions.length > 0" class="suggestions-dropdown">
              <button
                v-for="c in citySuggestions"
                :key="c.displayName"
                type="button"
                class="suggestion-item"
                @mousedown.prevent="selectCiudad(c)"
              >
                <span class="material-symbols-outlined suggestion-icon">location_on</span>
                <span class="suggestion-text">
                  <span class="suggestion-name">{{ c.shortName }}</span>
                  <span v-if="c.state || c.country" class="suggestion-sub">{{ [c.state, c.country].filter(Boolean).join(', ') }}</span>
                </span>
              </button>
            </div>
            <div class="chips-row">
              <button
                v-for="c in popularCiudades"
                :key="c"
                type="button"
                class="chip"
                :class="{ 'chip--active': form.location === c }"
                @click="selectCiudadPreset(c)"
              >{{ c }}</button>
            </div>
          </div>
          <div class="form-group form-group--sm">
            <label class="form-label">Máx. resultados</label>
            <select v-model="form.maxResults" class="form-select">
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
              <option :value="200">200</option>
              <option :value="500">500</option>
              <option :value="1000">1000</option>
            </select>
          </div>
        </div>
        <div class="form-footer">
          <w-button type="submit" variant="primary" :loading="creating">
            <span class="material-symbols-outlined mr-2">travel_explore</span>
            Iniciar búsqueda
          </w-button>
        </div>
        <p class="form-hint">
          <span class="material-symbols-outlined">info</span>
          Las búsquedas web pueden tardar varios minutos y no siempre encuentran email en todos los negocios — depende del rubro y de que tengan sitio web.
        </p>
      </form>
    </w-card>

    <!-- Search History -->
    <div class="searches-section">
      <p class="section-title">Historial de búsquedas</p>

      <div v-if="loading && items.length === 0" class="loading-state">
        <w-loading-skeleton />
      </div>

      <div v-else-if="items.length === 0" class="empty-state-wrapper">
        <w-empty-state message="No hay búsquedas aún. Iniciá tu primera búsqueda arriba." />
      </div>

      <div v-else class="searches-list">
        <div v-for="search in items" :key="search._id" class="search-card">
          <div class="search-card-left">
            <div class="search-status-dot" :style="{ background: getStatusColor(search.status) }"></div>
            <div class="search-info">
              <p class="search-query">{{ search.query }}</p>
              <p class="search-location">
                <span class="material-symbols-outlined">location_on</span>
                {{ search.location }}
              </p>
            </div>
          </div>
          <div class="search-card-center">
            <span class="search-status-badge" :style="{ color: getStatusColor(search.status) }">
              {{ getStatusLabel(search.status) }}
            </span>
            <span v-if="search.status === 'running'" class="running-indicator">
              <span class="material-symbols-outlined spinning">sync</span>
              Procesando...
            </span>
          </div>
          <div class="search-card-right">
            <div class="search-stats" v-if="search.status === 'completed'">
              <span class="stat">
                <span class="material-symbols-outlined">person_search</span>
                {{ search.leadsImported }} leads
              </span>
              <span v-if="search.stats?.withEmail != null" class="stat email-stat">
                <span class="material-symbols-outlined">mail</span>
                {{ search.stats.withEmail }} con email
              </span>
              <span v-if="search.stats?.duplicatesSkipped > 0" class="stat dup-stat">
                <span class="material-symbols-outlined">content_copy</span>
                {{ search.stats.duplicatesSkipped }} duplicados
              </span>
            </div>
            <div class="search-stats" v-else-if="search.status === 'failed'">
              <span class="stat error">
                <span class="material-symbols-outlined">error</span>
                Error en búsqueda
              </span>
            </div>
            <div class="search-actions">
              <button
                v-if="search.status === 'completed' || search.status === 'failed'"
                class="action-btn"
                @click="relaunchSearch(search)"
                title="Re-lanzar búsqueda"
              >
                <span class="material-symbols-outlined">refresh</span>
              </button>
              <router-link
                v-if="search.status === 'completed' && search.leadsImported > 0"
                :to="`/app/leads?searchId=${search._id}`"
                class="view-leads-btn"
              >
                Ver leads
              </router-link>
              <button class="action-btn text-error" @click="confirmDelete(search)" title="Eliminar">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useLeadSearchesStore } from '@/stores/lead-searches.store'
import { geoApi } from '@/api/geo/geo.api'
import type { CitySuggestion } from '@/api/geo/geo.types'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WLoadingSkeleton from '@/components/ui/WLoadingSkeleton.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'

const RUBROS = [
  'Restaurantes', 'Cafeterías', 'Bares', 'Panaderías', 'Comida rápida',
  'Ferreterías', 'Electricistas', 'Plomeros', 'Carpinterías', 'Herrerías',
  'Abogados', 'Contadores', 'Notarios', 'Gestores',
  'Dentistas', 'Médicos', 'Farmacias', 'Kinesiólogos', 'Psicólogos',
  'Peluquerías', 'Barberías', 'Spas', 'Estética',
  'Gimnasios', 'Yoga', 'Pilates', 'Crossfit',
  'Tiendas de ropa', 'Calzados', 'Deportes', 'Juguetes',
  'Veterinarias', 'Pet shops',
  'Florerías', 'Regalerías', 'Librerías',
  'Automotor', 'Talleres mecánicos', 'Neumáticos', 'Lubricentros',
  'Inmobiliarias', 'Arquitectos', 'Diseñadores', 'Fotógrafos',
  'Imprentas', 'Marketing', 'Desarrollo web', 'Consultoras',
  'Hoteles', 'Hostels', 'Cabañas', 'Eventos',
  'Jardinería', 'Paisajismo', 'Limpieza', 'Seguridad',
  'Kioscos', 'Supermercados', 'Verdulerías', 'Carnicerías',
  'Ópticas', 'Joyerías', 'Relojerías',
  'Música', 'Arte', 'Cursos', 'Academias',
]

const CIUDADES_POPULARES = [
  'Villa Mercedes, San Luis',
  'San Luis, San Luis',
  'Mendoza, Mendoza',
  'Córdoba, Córdoba',
  'Ciudad Autónoma de Buenos Aires',
  'Rosario, Santa Fe',
]

export default defineComponent({
  name: 'LeadSearchesPage',
  components: { WButton, WCard, WLoadingSkeleton, WEmptyState },
  data() {
    return {
      form: {
        query: '',
        location: '',
        maxResults: 20,
        sources: ['web'] as string[],
      },
      pollInterval: null as ReturnType<typeof setInterval> | null,
      activeSuggestions: null as null | 'query' | 'location',
      citySuggestions: [] as CitySuggestion[],
      citiesLoading: false,
      cityAbort: null as AbortController | null,
      cityDebounce: null as ReturnType<typeof setTimeout> | null,
    }
  },
  computed: {
    ...mapState(useLeadSearchesStore, ['items', 'loading', 'creating', 'activeSearch']),
    popularRubros(): string[] {
      return RUBROS.slice(0, 10)
    },
    popularCiudades(): string[] {
      return CIUDADES_POPULARES
    },
    filteredRubros(): string[] {
      const q = this.form.query.trim().toLowerCase()
      if (!q) return this.popularRubros
      return RUBROS.filter((r) => r.toLowerCase().includes(q)).slice(0, 8)
    },
  },
  methods: {
    ...mapActions(useLeadSearchesStore, ['fetchAll', 'create', 'remove', 'fetchById', 'updateItem']),
    async submitSearch() {
      try {
        await this.create({
          query: this.form.query,
          location: this.form.location,
          maxResults: this.form.maxResults,
          sources: this.form.sources as any[],
        })
        this.form.query = ''
        this.form.location = ''
        this.citySuggestions = []
        this.startPolling()
      } catch {
        // error toast shown by store
      }
    },
    async relaunchSearch(search: any) {
      this.form.query = search.query
      this.form.location = search.location
      this.form.maxResults = search.maxResults
      this.form.sources = search.sources?.length ? [...search.sources] : ['web']
      await this.submitSearch()
    },
    selectRubro(r: string) {
      this.form.query = r
      this.activeSuggestions = null
    },
    selectCiudad(c: CitySuggestion) {
      const label = [c.shortName, c.state].filter(Boolean).join(', ')
      this.form.location = label
      this.citySuggestions = []
      this.activeSuggestions = null
    },
    selectCiudadPreset(c: string) {
      this.form.location = c
      this.citySuggestions = []
      this.activeSuggestions = null
    },
    onLocationInput() {
      this.citySuggestions = []
      if (this.cityDebounce) clearTimeout(this.cityDebounce)
      if (this.cityAbort) this.cityAbort.abort()
      const q = this.form.location.trim()
      if (q.length < 3) return
      this.cityDebounce = setTimeout(() => this.fetchCities(q), 450)
    },
    async fetchCities(query: string) {
      this.cityAbort = new AbortController()
      this.citiesLoading = true
      try {
        const results = await geoApi.searchCities(query, this.cityAbort.signal)
        this.citySuggestions = results
      } catch {
        // aborted or network error — ignore
      } finally {
        this.citiesLoading = false
      }
    },
    hideSuggestions() {
      setTimeout(() => {
        this.activeSuggestions = null
      }, 150)
    },
    confirmDelete(search: any) {
      if (confirm(`¿Eliminar la búsqueda "${search.query}"?`)) {
        this.remove(search._id)
      }
    },
    startPolling() {
      if (this.pollInterval) return
      this.pollInterval = setInterval(async () => {
        const running = this.items.filter(s => s.status === 'running' || s.status === 'pending')
        if (running.length === 0) {
          this.stopPolling()
          return
        }
        for (const s of running) {
          const updated = await this.fetchById(s._id)
          if (updated) this.updateItem(updated)
        }
      }, 5000)
    },
    stopPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval)
        this.pollInterval = null
      }
    },
    getStatusColor(status: string) {
      const map: Record<string, string> = {
        pending: 'var(--color-text-muted)',
        running: 'var(--color-warning)',
        completed: 'var(--color-success)',
        failed: 'var(--color-error)',
      }
      return map[status] ?? 'var(--color-text-muted)'
    },
    getStatusLabel(status: string) {
      const map: Record<string, string> = {
        pending: 'En espera',
        running: 'Procesando',
        completed: 'Completada',
        failed: 'Error',
      }
      return map[status] ?? status
    },
  },
  mounted() {
    this.fetchAll()
    const hasActive = this.items.some(s => s.status === 'running' || s.status === 'pending')
    if (hasActive) this.startPolling()
  },
  beforeUnmount() {
    this.stopPolling()
    if (this.cityAbort) this.cityAbort.abort()
    if (this.cityDebounce) clearTimeout(this.cityDebounce)
  },
})
</script>

<style scoped>
.lead-searches-page {
  padding: 32px;
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 768px) {
  .lead-searches-page { padding: 16px; }
}

.page-header { flex-shrink: 0; }
.page-title { font-size: 24px; font-weight: 600; color: var(--color-text-base); }
.page-subtitle { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }

.form-section-title {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.search-form { display: flex; flex-direction: column; gap: 16px; }

.form-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 200px;
}

.form-group--sm { flex: 0 0 120px; min-width: 120px; }

.form-group--autocomplete {
  position: relative;
}

.form-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input, .form-select {
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text-base);
  outline: none;
  font-family: var(--font-body);
}

.form-input:focus {
  border-color: var(--color-primary);
}

.autocomplete-spinner {
  position: absolute;
  right: 10px;
  top: 32px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
}
.autocomplete-spinner span { font-size: 16px; }

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-top: none;
  z-index: 50;
  max-height: 240px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 13px;
}
.suggestion-item:hover {
  background: var(--color-bg-surface-highest);
}
.suggestion-icon {
  font-size: 16px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.suggestion-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.suggestion-name { font-size: 13px; color: var(--color-text-base); }
.suggestion-sub {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
}

.suggestions-empty {
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}
.chip {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 4px 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.chip--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.sources-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-base);
  cursor: pointer;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  padding: 8px 12px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
}
.form-hint span { font-size: 14px; flex-shrink: 0; }

.section-title {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.searches-list { display: flex; flex-direction: column; gap: 8px; }

.search-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 16px;
  flex-wrap: wrap;
}

.search-card-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 200px; }
.search-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.search-query { font-size: 14px; font-weight: 500; color: var(--color-text-base); }
.search-location { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }
.search-location span { font-size: 14px; }

.search-card-center { display: flex; flex-direction: column; gap: 4px; min-width: 120px; }
.search-status-badge { font-family: var(--font-mono); font-size: 11px; font-weight: 600; }
.running-indicator { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-text-muted); }

.search-card-right { display: flex; align-items: center; gap: 16px; margin-left: auto; }
.search-stats { display: flex; flex-direction: column; gap: 4px; }
.stat { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }
.stat span { font-size: 14px; }
.stat.error { color: var(--color-error); }
.stat.email-stat { color: var(--color-primary); }
.stat.dup-stat { color: var(--color-text-disabled); }

.search-actions { display: flex; align-items: center; gap: 8px; }
.view-leads-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-primary);
  text-decoration: none;
  border: 1px solid var(--color-primary);
  padding: 4px 10px;
}
.view-leads-btn:hover { background: var(--color-primary); color: white; }

.action-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 4px;
}
.action-btn:hover { color: var(--color-text-base); }
.text-error { color: var(--color-error) !important; }

.loading-state, .empty-state-wrapper { padding: 32px 0; }

@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinning { display: inline-block; animation: spin 1s linear infinite; }

.mr-2 { margin-right: 8px; }
</style>
