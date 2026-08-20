<template>
  <div class="resources-page">
    <!-- Hero Header -->
    <div class="page-hero">
      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="material-symbols-outlined">school</span>
          Academia Orkpad
        </div>
        <h1 class="hero-title">Recursos para Freelancers</h1>
        <p class="hero-subtitle">
          Guías prácticas sobre propuestas, contratos, cobros y gestión de clientes para hacer crecer tu negocio independiente.
        </p>
        <div class="search-wrapper">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="Buscar recursos..."
            @input="onSearch"
          />
          <button v-if="searchQuery" class="search-clear" @click="clearSearch">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Layout: sidebar + grid -->
    <div class="resources-layout">
      <!-- Categories sidebar -->
      <aside class="categories-sidebar">
        <p class="sidebar-label">Categorías</p>
        <button
          :class="['category-btn', { 'category-btn--active': !activeCategory }]"
          @click="setCategory(null)"
        >
          <span class="material-symbols-outlined">grid_view</span>
          <span>Todos</span>
          <span class="count-chip">{{ store.total }}</span>
        </button>
        <button
          v-for="cat in store.categories"
          :key="cat._id"
          :class="['category-btn', { 'category-btn--active': activeCategory === cat._id }]"
          @click="setCategory(cat._id)"
        >
          <span class="material-symbols-outlined">{{ cat.icon || 'folder' }}</span>
          <span>{{ cat.name }}</span>
        </button>
      </aside>

      <!-- Cards grid -->
      <main class="resources-main">
        <!-- Loading skeleton -->
        <template v-if="store.loading">
          <div class="resources-grid">
            <div v-for="n in 6" :key="n" class="resource-card resource-card--skeleton">
              <div class="skeleton-accent"></div>
              <div class="skeleton-body">
                <div class="skeleton-line skeleton-line--short"></div>
                <div class="skeleton-line skeleton-line--title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line skeleton-line--medium"></div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <div v-else-if="!store.items.length" class="empty-state">
          <span class="material-symbols-outlined empty-icon">auto_stories</span>
          <p class="empty-title">No hay recursos disponibles</p>
          <p class="empty-sub">Volvé pronto — estamos agregando contenido.</p>
        </div>

        <!-- Grid -->
        <div v-else class="resources-grid">
          <article
            v-for="resource in store.items"
            :key="resource._id"
            class="resource-card"
            @click="goToResource(resource.slug)"
          >
            <div class="card-accent"></div>
            <div class="card-body">
              <div class="card-meta">
                <span class="card-category">{{ getCategoryName(resource.categoryId) }}</span>
                <span v-if="resource.readTimeMinutes" class="card-readtime">
                  <span class="material-symbols-outlined">schedule</span>
                  {{ resource.readTimeMinutes }} min
                </span>
              </div>
              <h3 class="card-title">{{ resource.title }}</h3>
              <p class="card-excerpt">{{ resource.excerpt }}</p>
              <div class="card-tags">
                <span v-for="tag in resource.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
              </div>
              <div class="card-footer">
                <span class="card-cta">Leer guía <span class="material-symbols-outlined">arrow_forward</span></span>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResourcesStore } from '@/stores/resources.store'

export default defineComponent({
  name: 'ResourcesPage',
  setup() {
    const router = useRouter()
    const store = useResourcesStore()
    const searchQuery = ref('')
    const activeCategory = ref<string | null>(null)
    let searchTimer: ReturnType<typeof setTimeout> | null = null

    onMounted(async () => {
      await Promise.all([store.fetchCategories(), store.fetchAll()])
    })

    const onSearch = () => {
      if (searchTimer) clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        store.fetchAll({ search: searchQuery.value || undefined, category: activeCategory.value || undefined })
      }, 350)
    }

    const clearSearch = () => {
      searchQuery.value = ''
      store.fetchAll({ category: activeCategory.value || undefined })
    }

    const setCategory = (id: string | null) => {
      activeCategory.value = id
      store.fetchAll({ search: searchQuery.value || undefined, category: id || undefined })
    }

    const goToResource = (slug: string) => {
      router.push({ name: 'resource-detail', params: { slug } })
    }

    const getCategoryName = (id?: string | null) => {
      if (!id) return 'General'
      return store.categoryMap[id]?.name ?? 'General'
    }

    return { store, searchQuery, activeCategory, onSearch, clearSearch, setCategory, goToResource, getCategoryName }
  },
})
</script>

<style scoped>
.resources-page {
  min-height: 100vh;
  background: var(--color-bg-base);
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */
.page-hero {
  background: var(--color-bg-base);
  border-bottom: 1px solid var(--color-border);
  padding: 28px 40px 24px;
}

.hero-content {
  max-width: 640px;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-primary);
  margin-bottom: 16px;
}

.hero-eyebrow .material-symbols-outlined {
  font-size: 16px;
}

.hero-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
  margin: 0 0 12px;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.hero-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0 0 24px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-disabled);
  font-size: 18px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 40px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0px;
  color: var(--color-text-base);
  font-size: 14px;
  font-family: var(--font-body);
  transition: border-color 0.2s;
  outline: none;
}

.search-input:focus {
  border-color: var(--color-primary);
}

.search-input::placeholder {
  color: var(--color-text-disabled);
}

.search-clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
}

.search-clear .material-symbols-outlined {
  font-size: 16px;
}

/* ── Layout ─────────────────────────────────────────────────────────────────── */
.resources-layout {
  display: flex;
  gap: 0;
  min-height: calc(100vh - 200px);
}

.categories-sidebar {
  width: 220px;
  flex-shrink: 0;
  padding: 28px 16px;
  border-right: 1px solid var(--color-border);
}

.sidebar-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-disabled);
  margin: 0 0 12px 8px;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  border-radius: 0px;
  color: var(--color-text-muted);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  margin-bottom: 2px;
}

.category-btn .material-symbols-outlined {
  font-size: 16px;
  flex-shrink: 0;
}

.category-btn:hover {
  background: var(--color-bg-surface);
  color: var(--color-text-base);
}

.category-btn--active {
  background: color-mix(in srgb, var(--color-primary) 12%, transparent) !important;
  color: var(--color-primary) !important;
  font-weight: 600;
}

.count-chip {
  margin-left: auto;
  background: var(--color-bg-surface-highest);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 0px;
}

.category-btn--active .count-chip {
  background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  color: var(--color-primary);
}

/* ── Main grid ──────────────────────────────────────────────────────────────── */
.resources-main {
  flex: 1;
  padding: 28px 32px;
  min-width: 0;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* ── Resource Card ──────────────────────────────────────────────────────────── */
.resource-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  display: flex;
  flex-direction: column;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: color-mix(in srgb, var(--color-primary) 40%, var(--color-border));
}

.card-accent {
  height: 3px;
  width: 100%;
  background: var(--color-primary);
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.card-category {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-primary);
  font-weight: 600;
}

.card-readtime {
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-disabled);
}

.card-readtime .material-symbols-outlined {
  font-size: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-base);
  line-height: 1.4;
  margin: 0 0 8px;
}

.card-excerpt {
  font-size: 12.5px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0 0 16px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 16px;
}

.tag {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 0px;
  background: var(--color-bg-surface-highest);
  color: var(--color-text-muted);
  text-transform: lowercase;
}

.card-footer {
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
  margin-top: auto;
}

.card-cta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-primary);
}

.card-cta .material-symbols-outlined {
  font-size: 14px;
}

/* ── Skeleton ───────────────────────────────────────────────────────────────── */
.resource-card--skeleton {
  cursor: default;
  pointer-events: none;
}

.resource-card--skeleton:hover {
  transform: none;
  box-shadow: none;
}

.skeleton-accent {
  height: 3px;
  background: var(--color-bg-surface-highest);
}

.skeleton-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  height: 10px;
  border-radius: 0px;
  background: linear-gradient(90deg, var(--color-bg-surface-highest) 25%, var(--color-border) 50%, var(--color-bg-surface-highest) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line--short { width: 40%; height: 8px; }
.skeleton-line--title { width: 85%; height: 16px; }
.skeleton-line--medium { width: 60%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Empty state ────────────────────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 12px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--color-text-disabled);
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-muted);
  margin: 0;
}

.empty-sub {
  font-size: 13px;
  color: var(--color-text-disabled);
  margin: 0;
}

/* ── Responsive ─────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .page-hero {
    padding: 32px 20px 24px;
  }

  .resources-layout {
    flex-direction: column;
  }

  .categories-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding: 16px 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .sidebar-label {
    width: 100%;
    margin-bottom: 4px;
  }

  .category-btn {
    width: auto;
    padding: 6px 12px;
  }

  .resources-main {
    padding: 20px;
  }

  .resources-grid {
    grid-template-columns: 1fr;
  }
}
</style>
