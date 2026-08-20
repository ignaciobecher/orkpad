<template>
  <div class="resource-detail-page">
    <!-- Loading state -->
    <div v-if="store.loadingDetail" class="detail-loading">
      <div class="loading-header">
        <div class="skeleton-line skeleton-line--breadcrumb"></div>
        <div class="skeleton-line skeleton-line--badge"></div>
        <div class="skeleton-line skeleton-line--title"></div>
        <div class="skeleton-line skeleton-line--subtitle"></div>
      </div>
      <div class="loading-body">
        <div v-for="n in 8" :key="n" class="skeleton-line" :style="{ width: lineWidths[n % lineWidths.length] }"></div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!store.selected && !store.loadingDetail" class="not-found">
      <span class="material-symbols-outlined not-found-icon">broken_image</span>
      <h2>Recurso no encontrado</h2>
      <button class="back-btn-alt" @click="$router.push('/app/resources')">← Volver a Recursos</button>
    </div>

    <!-- Article -->
    <template v-else-if="store.selected">
      <!-- Top bar -->
      <div class="article-topbar">
        <button class="back-btn" @click="$router.push('/app/resources')">
          <span class="material-symbols-outlined">arrow_back</span>
          Recursos
        </button>
        <div class="topbar-right">
          <span v-if="store.selected.readTimeMinutes" class="readtime-chip">
            <span class="material-symbols-outlined">schedule</span>
            {{ store.selected.readTimeMinutes }} min de lectura
          </span>
        </div>
      </div>

      <!-- Article content -->
      <div class="article-wrapper">
        <article class="article">
          <!-- Header -->
          <header class="article-header">
            <div class="category-accent"></div>

            <div class="article-meta">
              <span class="category-badge">{{ categoryName }}</span>
              <span v-if="store.selected.publishedAt" class="publish-date">
                {{ formatDate(store.selected.publishedAt) }}
              </span>
            </div>

            <h1 class="article-title">{{ store.selected.title }}</h1>

            <p v-if="store.selected.excerpt" class="article-lead">
              {{ store.selected.excerpt }}
            </p>

            <div v-if="store.selected.tags.length" class="article-tags">
              <span
                v-for="tag in store.selected.tags"
                :key="tag"
                class="tag"
              >{{ tag }}</span>
            </div>
          </header>

          <!-- Body -->
          <div
            class="article-body"
            v-html="renderedContent"
          ></div>

          <!-- Footer -->
          <footer class="article-footer">
            <div class="footer-divider"></div>
            <p class="footer-text">
              ¿Te fue útil este recurso?
              <button class="footer-link" @click="$router.push('/app/resources')">Ver más guías →</button>
            </p>
          </footer>
        </article>

        <!-- Sidebar TOC -->
        <aside v-if="headings.length > 2" class="toc-sidebar">
          <p class="toc-label">En este artículo</p>
          <nav class="toc-nav">
            <a
              v-for="h in headings"
              :key="h.id"
              :href="`#${h.id}`"
              :class="['toc-link', `toc-link--h${h.level}`]"
            >{{ h.text }}</a>
          </nav>
        </aside>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResourcesStore } from '@/stores/resources.store'
import { renderMarkdown } from '@/utils/markdown'

interface Heading { id: string; text: string; level: number }

const LINE_WIDTHS = ['100%', '95%', '88%', '100%', '72%', '96%', '84%', '91%']

function extractHeadings(html: string): Heading[] {
  const regex = /<h([23])>([^<]+)<\/h[23]>/g
  const headings: Heading[] = []
  let match
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      text: match[2].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      id: match[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    })
  }
  return headings
}

function injectHeadingIds(html: string): string {
  return html.replace(/<h([23])>([^<]+)<\/h[23]>/g, (_, level, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return `<h${level} id="${id}">${text}</h${level}>`
  })
}

export default defineComponent({
  name: 'ResourceDetailPage',
  setup() {
    const route = useRoute()
    const store = useResourcesStore()

    onMounted(async () => {
      if (!store.categories.length) await store.fetchCategories()
      await store.fetchBySlug(route.params.slug as string)
    })

    watch(() => route.params.slug, async (slug) => {
      if (slug) await store.fetchBySlug(slug as string)
    })

    const renderedRaw = computed(() =>
      store.selected ? renderMarkdown(store.selected.content) : ''
    )

    const renderedContent = computed(() => injectHeadingIds(renderedRaw.value))
    const headings = computed(() => extractHeadings(renderedRaw.value))

    const categoryName = computed(() => {
      if (!store.selected?.categoryId) return 'General'
      return store.categoryMap[store.selected.categoryId]?.name ?? 'General'
    })

    const formatDate = (date?: string | null) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    return {
      store,
      renderedContent,
      headings,
      categoryName,
      formatDate,
      lineWidths: LINE_WIDTHS,
    }
  },
})
</script>

<style scoped>
.resource-detail-page {
  min-height: 100vh;
  background: var(--color-bg-base);
}

/* ── Topbar ─────────────────────────────────────────────────────────────────── */
.article-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-base);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 13px;
  font-family: var(--font-mono);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 0px;
  transition: all 0.15s;
}

.back-btn:hover {
  background: var(--color-bg-surface);
  color: var(--color-text-base);
}

.back-btn .material-symbols-outlined {
  font-size: 16px;
}

.readtime-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-disabled);
}

.readtime-chip .material-symbols-outlined {
  font-size: 14px;
}

/* ── Article wrapper ────────────────────────────────────────────────────────── */
.article-wrapper {
  display: flex;
  gap: 48px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 40px;
  align-items: flex-start;
}

.article {
  flex: 1;
  min-width: 0;
  max-width: 720px;
}

/* ── Article header ─────────────────────────────────────────────────────────── */
.category-accent {
  height: 3px;
  border-radius: 0px;
  width: 40px;
  margin-bottom: 20px;
  background: var(--color-primary);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.category-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  padding: 3px 10px;
  border-radius: 0px;
}

.publish-date {
  font-size: 12px;
  color: var(--color-text-disabled);
}

.article-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-base);
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}

.article-lead {
  font-size: 16px;
  color: var(--color-text-muted);
  line-height: 1.7;
  margin: 0 0 24px;
  border-left: 3px solid var(--color-primary);
  padding-left: 16px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--color-border);
}

.tag {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 3px 10px;
  border-radius: 0px;
  background: var(--color-bg-surface-highest);
  color: var(--color-text-muted);
}

/* ── Article body (markdown output) ────────────────────────────────────────── */
.article-body {
  font-size: 15px;
  line-height: 1.8;
  color: var(--color-text-base);
}

.article-body :deep(h1),
.article-body :deep(h2),
.article-body :deep(h3),
.article-body :deep(h4) {
  font-weight: 700;
  color: var(--color-text-base);
  line-height: 1.3;
  margin: 2em 0 0.6em;
  letter-spacing: -0.01em;
}

.article-body :deep(h1) { font-size: 22px; }
.article-body :deep(h2) { font-size: 19px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px; }
.article-body :deep(h3) { font-size: 16px; }
.article-body :deep(h4) { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }

.article-body :deep(p) {
  margin: 0 0 1.2em;
  color: var(--color-text-muted);
}

.article-body :deep(strong) {
  font-weight: 600;
  color: var(--color-text-base);
}

.article-body :deep(em) {
  font-style: italic;
  color: var(--color-text-muted);
}

.article-body :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  padding-left: 24px;
  margin: 0 0 1.2em;
  color: var(--color-text-muted);
}

.article-body :deep(li) {
  margin-bottom: 6px;
  line-height: 1.7;
}

.article-body :deep(blockquote) {
  border-left: 3px solid var(--color-primary);
  padding: 12px 20px;
  margin: 1.5em 0;
  background: color-mix(in srgb, var(--color-primary) 6%, var(--color-bg-surface));
  border-radius: 0px;
  color: var(--color-text-base);
  font-style: italic;
}

.article-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 13px;
  background: var(--color-bg-surface-highest);
  color: var(--color-primary);
  padding: 2px 6px;
  border-radius: 0px;
}

.article-body :deep(pre) {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0px;
  padding: 20px;
  overflow-x: auto;
  margin: 1.5em 0;
}

.article-body :deep(pre code) {
  background: none;
  color: var(--color-text-base);
  padding: 0;
  font-size: 13px;
  line-height: 1.7;
}

.article-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 2em 0;
}

/* ── TOC Sidebar ────────────────────────────────────────────────────────────── */
.toc-sidebar {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 72px;
}

.toc-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-disabled);
  margin: 0 0 12px;
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toc-link {
  font-size: 12.5px;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 0px;
  border-left: 2px solid transparent;
  transition: all 0.15s;
  line-height: 1.4;
}

.toc-link--h3 {
  padding-left: 20px;
  font-size: 12px;
}

.toc-link:hover {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
}

/* ── Article footer ─────────────────────────────────────────────────────────── */
.article-footer {
  margin-top: 48px;
}

.footer-divider {
  height: 1px;
  background: var(--color-border);
  margin-bottom: 24px;
}

.footer-text {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
}

.footer-link {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
}

/* ── Loading skeleton ───────────────────────────────────────────────────────── */
.detail-loading {
  padding: 40px;
  max-width: 760px;
  margin: 0 auto;
}

.loading-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--color-border);
}

.loading-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  height: 12px;
  border-radius: 0px;
  background: linear-gradient(90deg, var(--color-bg-surface-highest) 25%, var(--color-border) 50%, var(--color-bg-surface-highest) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line--breadcrumb { width: 100px; height: 10px; }
.skeleton-line--badge { width: 80px; height: 20px; border-radius: 0px; }
.skeleton-line--title { width: 75%; height: 32px; }
.skeleton-line--subtitle { width: 60%; height: 18px; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Not found ──────────────────────────────────────────────────────────────── */
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  text-align: center;
}

.not-found-icon {
  font-size: 56px;
  color: var(--color-text-disabled);
}

.not-found h2 {
  font-size: 20px;
  color: var(--color-text-muted);
  margin: 0;
}

.back-btn-alt {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 8px 16px;
  border-radius: 0px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.back-btn-alt:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ── Responsive ─────────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .article-wrapper {
    padding: 24px 20px;
    flex-direction: column;
    gap: 0;
  }

  .toc-sidebar {
    display: none;
  }

  .article-topbar {
    padding: 12px 20px;
  }

  .article-title {
    font-size: 22px;
  }
}
</style>
