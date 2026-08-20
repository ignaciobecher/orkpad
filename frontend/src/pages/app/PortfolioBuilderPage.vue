<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { usePortfolioBuilderStore } from '@/stores/portfolio-builder.store'
import { SECTION_BLOCKS, SECTION_LABELS, type SectionType, type PortfolioSection } from '@/api/portfolio/portfolio-builder.types'
import BlockPalette from '@/components/portfolio/builder/BlockPalette.vue'
import SectionBlock from '@/components/portfolio/builder/SectionBlock.vue'
import PropertiesPanel from '@/components/portfolio/builder/PropertiesPanel.vue'
import ThemeEditor from '@/components/portfolio/builder/ThemeEditor.vue'
import SeoEditor from '@/components/portfolio/builder/SeoEditor.vue'
import ProfileEditor from '@/components/portfolio/builder/ProfileEditor.vue'
import PublishPanel from '@/components/portfolio/builder/PublishPanel.vue'
import { showToast } from '@/composables/useToast'
import { workspacesApi } from '@/api/workspaces/workspaces.api'
import type { Workspace } from '@/api/workspaces/workspaces.types'

const builderStore = usePortfolioBuilderStore()
const router = useRouter()

const workspaceSlug = ref<string | null>(null)
const workspace = ref<Workspace | null>(null)
const activePanel = ref<'theme' | 'seo' | 'profile' | 'publish' | null>(null)
const confirmRemoveId = ref<string | null>(null)
const mobileTab = ref<'blocks' | 'canvas' | 'page'>('canvas')
const showMobileSheet = ref(false)

const draggableSections = ref<PortfolioSection[]>([])
let _syncingFromStore = false

watch(
  () => builderStore.sortedSections,
  (sections) => {
    if (!_syncingFromStore) {
      draggableSections.value = [...sections]
    }
  },
  { immediate: true, deep: true },
)

function onDragEnd() {
  _syncingFromStore = true
  builderStore.reorderSections(draggableSections.value)
  _syncingFromStore = false
}

function handleAddSection(type: SectionType) {
  const block = SECTION_BLOCKS.find(b => b.type === type)
  if (block) {
    builderStore.addSection(type, block.defaultContent, block.defaultSettings)
    activePanel.value = null
    mobileTab.value = 'canvas'
    showMobileSheet.value = false
  }
}

function openPreview() {
  const resolved = router.resolve({ name: 'portfolio-preview' })
  window.open(resolved.href, '_blank')
}

function onWorkspaceUpdated(updated: Workspace) {
  workspace.value = updated
  workspaceSlug.value = updated.slug
}

async function handleSave() {
  try {
    await builderStore.savePage()
    showToast('Portfolio guardado exitosamente', 'success')
  } catch {
    // error toast already shown by store
  }
}

function confirmRemove(id: string) {
  confirmRemoveId.value = id
}

function doRemoveSection() {
  if (confirmRemoveId.value) {
    builderStore.removeSection(confirmRemoveId.value)
    confirmRemoveId.value = null
  }
}

function openDesktopPanel(panel: 'theme' | 'seo' | 'profile' | 'publish') {
  activePanel.value = panel
  builderStore.selectSection(null)
}

function openMobilePanel(panel: 'theme' | 'seo' | 'profile' | 'publish') {
  activePanel.value = panel
  builderStore.selectSection(null)
  showMobileSheet.value = true
}

function onSectionSelect(id: string) {
  builderStore.selectSection(id)
  activePanel.value = null
  showMobileSheet.value = true
}

function closeMobileSheet() {
  showMobileSheet.value = false
  builderStore.selectSection(null)
  activePanel.value = null
}

function setMobileTab(tab: 'blocks' | 'canvas' | 'page') {
  mobileTab.value = tab
  showMobileSheet.value = false
  if (tab !== 'canvas') builderStore.selectSection(null)
  if (tab !== 'page') activePanel.value = null
}

const showRightPanel = computed(
  () => activePanel.value !== null || builderStore.selectedSection !== null,
)

const mobileSheetTitle = computed(() => {
  if (activePanel.value === 'theme') return 'Tema'
  if (activePanel.value === 'seo') return 'SEO'
  if (activePanel.value === 'profile') return 'Perfil'
  if (activePanel.value === 'publish') return 'Publicar'
  if (builderStore.selectedSection) return SECTION_LABELS[builderStore.selectedSection.type]
  return ''
})

onMounted(async () => {
  try {
    const [{ data: ws }] = await Promise.all([
      workspacesApi.getMe(),
      builderStore.fetchPage(),
    ])
    workspace.value = ws
    workspaceSlug.value = ws.slug
  } catch {
    // error toast already shown by store for fetchPage
  }
})
</script>

<template>
  <div class="pb">
    <!-- Top bar -->
    <header class="pb__topbar">
      <div class="pb__topbar-left">
        <router-link :to="{ name: 'portfolio' }" class="pb__back">
          <span class="mdi mdi-arrow-left"></span>
        </router-link>
        <span class="pb__title">Portfolio Builder</span>
        <span v-if="builderStore.isDirty" class="pb__dirty">● Sin guardar</span>
      </div>
      <div class="pb__topbar-right">
        <button class="pb__btn pb__btn--ghost" @click="openPreview">
          <span class="mdi mdi-open-in-new"></span>
          <span class="pb__topbar-label">Vista previa</span>
        </button>
        <button
          class="pb__btn pb__btn--primary"
          :disabled="builderStore.saving"
          @click="handleSave"
        >
          <span
            class="mdi"
            :class="builderStore.saving ? 'mdi-loading mdi-spin' : 'mdi-content-save'"
          ></span>
          <span class="pb__topbar-label">{{ builderStore.saving ? 'Guardando...' : 'Guardar' }}</span>
        </button>
      </div>
    </header>

    <!-- Desktop 3-panel body -->
    <div class="pb__body">
      <!-- Left sidebar (desktop only) -->
      <aside class="pb__left">
        <div class="pb__panel-section">
          <p class="pb__panel-heading">Bloques</p>
          <BlockPalette @add="handleAddSection" />
        </div>
        <div class="pb__panel-section">
          <p class="pb__panel-heading">Página</p>
          <button
            class="pb__config-btn"
            :class="{ 'pb__config-btn--active': activePanel === 'theme' }"
            @click="openDesktopPanel('theme')"
          >
            <span class="mdi mdi-palette-outline"></span>Tema y colores
          </button>
          <button
            class="pb__config-btn"
            :class="{ 'pb__config-btn--active': activePanel === 'seo' }"
            @click="openDesktopPanel('seo')"
          >
            <span class="mdi mdi-magnify"></span>SEO &amp; metadatos
          </button>
          <button
            class="pb__config-btn"
            :class="{ 'pb__config-btn--active': activePanel === 'profile' }"
            @click="openDesktopPanel('profile')"
          >
            <span class="mdi mdi-account-edit-outline"></span>Perfil
          </button>
          <button
            class="pb__config-btn"
            :class="{ 'pb__config-btn--active': activePanel === 'publish' }"
            @click="openDesktopPanel('publish')"
          >
            <span class="mdi mdi-rocket-launch-outline"></span>Publicar
          </button>
        </div>
      </aside>

      <!-- Canvas -->
      <main class="pb__canvas">
        <div v-if="builderStore.loading" class="pb__state">
          <span class="mdi mdi-loading mdi-spin" style="font-size:32px"></span>
        </div>
        <div
          v-else-if="builderStore.error"
          class="pb__state pb__state--error"
        >
          <span class="mdi mdi-alert-circle-outline pb__empty-icon"></span>
          <p class="pb__empty-title">Error al cargar el portfolio</p>
          <p class="pb__empty-sub">{{ builderStore.error }}</p>
          <button class="pb__btn pb__btn--primary" style="margin-top:12px" @click="builderStore.fetchPage()">
            Reintentar
          </button>
        </div>
        <div
          v-else-if="builderStore.sortedSections.length === 0"
          class="pb__state pb__state--empty"
        >
          <span class="mdi mdi-view-dashboard-outline pb__empty-icon"></span>
          <p class="pb__empty-title">Tu portfolio está vacío</p>
          <p class="pb__empty-sub">
            Agrega bloques desde el panel izquierdo para construir tu página.
          </p>
        </div>
        <draggable
          v-else
          v-model="draggableSections"
          item-key="id"
          handle=".section-block__grip"
          animation="200"
          ghost-class="section-block--ghost"
          :delay="100"
          :delay-on-touch-only="true"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <SectionBlock
              :section="element"
              :selected="element.id === builderStore.selectedSectionId"
              :position="draggableSections.findIndex(s => s.id === element.id) + 1"
              :total="draggableSections.length"
              @select="onSectionSelect(element.id)"
              @toggle-visibility="builderStore.toggleSectionVisibility(element.id)"
              @remove="confirmRemove(element.id)"
              @move-up="builderStore.moveSectionUp(element.id)"
              @move-down="builderStore.moveSectionDown(element.id)"
              @duplicate="builderStore.duplicateSection(element.id)"
            />
          </template>
        </draggable>
      </main>

      <!-- Right panel (desktop only) -->
      <aside v-if="showRightPanel" class="pb__right">
        <template v-if="activePanel === 'theme'">
          <div class="pb__panel-header">
            <span class="pb__panel-title">Tema</span>
            <button class="pb__close-btn" @click="activePanel = null">
              <span class="mdi mdi-close"></span>
            </button>
          </div>
          <ThemeEditor
            :theme="builderStore.page.theme"
            @update="builderStore.updateTheme($event)"
          />
        </template>
        <template v-else-if="activePanel === 'seo'">
          <div class="pb__panel-header">
            <span class="pb__panel-title">SEO</span>
            <button class="pb__close-btn" @click="activePanel = null">
              <span class="mdi mdi-close"></span>
            </button>
          </div>
          <SeoEditor
            :seo="builderStore.page.seo"
            @update="builderStore.updateSeo($event)"
          />
        </template>
        <template v-else-if="activePanel === 'profile'">
          <div class="pb__panel-header">
            <span class="pb__panel-title">Perfil</span>
            <button class="pb__close-btn" @click="activePanel = null">
              <span class="mdi mdi-close"></span>
            </button>
          </div>
          <ProfileEditor v-if="workspace" :workspace="workspace" @saved="onWorkspaceUpdated" />
        </template>
        <template v-else-if="activePanel === 'publish'">
          <div class="pb__panel-header">
            <span class="pb__panel-title">Publicar</span>
            <button class="pb__close-btn" @click="activePanel = null">
              <span class="mdi mdi-close"></span>
            </button>
          </div>
          <PublishPanel v-if="workspace" :workspace="workspace" @updated="onWorkspaceUpdated" />
        </template>
        <template v-else-if="builderStore.selectedSection">
          <div class="pb__panel-header">
            <span class="pb__panel-title">{{
              SECTION_LABELS[builderStore.selectedSection.type]
            }}</span>
            <button class="pb__close-btn" @click="builderStore.selectSection(null)">
              <span class="mdi mdi-close"></span>
            </button>
          </div>
          <PropertiesPanel
            :section="builderStore.selectedSection"
            @update-content="
              builderStore.updateSectionContent(builderStore.selectedSection!.id, $event)
            "
            @update-settings="
              builderStore.updateSectionSettings(builderStore.selectedSection!.id, $event)
            "
          />
        </template>
      </aside>
    </div>

    <!-- Mobile bottom tab bar -->
    <nav class="pb__tabs">
      <button
        class="pb__tab"
        :class="{ 'pb__tab--active': mobileTab === 'blocks' }"
        @click="setMobileTab('blocks')"
      >
        <span class="mdi mdi-plus-box-outline"></span>
        <span>Bloques</span>
      </button>
      <button
        class="pb__tab"
        :class="{ 'pb__tab--active': mobileTab === 'canvas' }"
        @click="setMobileTab('canvas')"
      >
        <span class="mdi mdi-view-list-outline"></span>
        <span>Secciones</span>
        <span v-if="builderStore.sortedSections.length" class="pb__tab-badge">{{
          builderStore.sortedSections.length
        }}</span>
      </button>
      <button
        class="pb__tab"
        :class="{ 'pb__tab--active': mobileTab === 'page' }"
        @click="setMobileTab('page')"
      >
        <span class="mdi mdi-cog-outline"></span>
        <span>Página</span>
      </button>
    </nav>

    <!-- Mobile: Blocks overlay panel -->
    <Teleport to="body">
      <div v-if="mobileTab === 'blocks'" class="pb__mob-panel">
        <div class="pb__panel-header">
          <span class="pb__panel-title">Agregar bloque</span>
          <button class="pb__close-btn" @click="setMobileTab('canvas')">
            <span class="mdi mdi-close"></span>
          </button>
        </div>
        <div class="pb__mob-panel__body">
          <BlockPalette @add="handleAddSection" />
        </div>
      </div>
    </Teleport>

    <!-- Mobile: Page config overlay -->
    <Teleport to="body">
      <div v-if="mobileTab === 'page'" class="pb__mob-panel">
        <div class="pb__panel-header">
          <span class="pb__panel-title">Configurar página</span>
        </div>
        <div class="pb__mob-panel__body">
          <button class="pb__mob-menu-item" @click="openMobilePanel('theme')">
            <span class="mdi mdi-palette-outline pb__mob-menu-icon"></span>
            <div class="pb__mob-menu-text">
              <p class="pb__mob-menu-label">Tema y colores</p>
              <p class="pb__mob-menu-sub">Personaliza colores y tipografía</p>
            </div>
            <span class="mdi mdi-chevron-right pb__mob-menu-arrow"></span>
          </button>
          <button class="pb__mob-menu-item" @click="openMobilePanel('seo')">
            <span class="mdi mdi-magnify pb__mob-menu-icon"></span>
            <div class="pb__mob-menu-text">
              <p class="pb__mob-menu-label">SEO &amp; metadatos</p>
              <p class="pb__mob-menu-sub">Título, descripción e imagen OG</p>
            </div>
            <span class="mdi mdi-chevron-right pb__mob-menu-arrow"></span>
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Mobile: Bottom sheet (section props / theme / seo) -->
    <Teleport to="body">
      <div v-if="showMobileSheet" class="pb__backdrop" @click="closeMobileSheet"></div>
      <div v-if="showMobileSheet" class="pb__sheet">
        <div class="pb__sheet-handle"></div>
        <div class="pb__panel-header">
          <span class="pb__panel-title">{{ mobileSheetTitle }}</span>
          <button class="pb__close-btn" @click="closeMobileSheet">
            <span class="mdi mdi-close"></span>
          </button>
        </div>
        <div class="pb__sheet-body">
          <ThemeEditor
            v-if="activePanel === 'theme'"
            :theme="builderStore.page.theme"
            @update="builderStore.updateTheme($event)"
          />
          <SeoEditor
            v-else-if="activePanel === 'seo'"
            :seo="builderStore.page.seo"
            @update="builderStore.updateSeo($event)"
          />
          <ProfileEditor
            v-else-if="activePanel === 'profile' && workspace"
            :workspace="workspace"
            @saved="onWorkspaceUpdated"
          />
          <PublishPanel
            v-else-if="activePanel === 'publish' && workspace"
            :workspace="workspace"
            @updated="onWorkspaceUpdated"
          />
          <PropertiesPanel
            v-else-if="builderStore.selectedSection"
            :section="builderStore.selectedSection"
            @update-content="
              builderStore.updateSectionContent(builderStore.selectedSection!.id, $event)
            "
            @update-settings="
              builderStore.updateSectionSettings(builderStore.selectedSection!.id, $event)
            "
          />
        </div>
      </div>
    </Teleport>

    <!-- Confirm remove -->
    <Teleport to="body">
      <div v-if="confirmRemoveId" class="pb__overlay" @click="confirmRemoveId = null">
        <div class="pb__confirm" @click.stop>
          <p class="pb__confirm-title">¿Eliminar sección?</p>
          <p class="pb__confirm-sub">Esta acción no se puede deshacer.</p>
          <div class="pb__confirm-actions">
            <button class="pb__btn pb__btn--ghost" @click="confirmRemoveId = null">Cancelar</button>
            <button class="pb__btn pb__btn--danger" @click="doRemoveSection">Eliminar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ===== BASE (desktop) ===== */
.pb {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg-base);
  color: var(--color-text-base);
  overflow: hidden;
}
.pb__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 16px;
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  z-index: 10;
}
.pb__topbar-left,
.pb__topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pb__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 18px;
  transition: color 0.15s;
}
.pb__back:hover { color: var(--color-text-base); }
.pb__title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.pb__dirty {
  font-size: 11px;
  color: var(--color-warning);
}
.pb__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.pb__btn--ghost {
  background: transparent;
  color: var(--color-text-muted);
}
.pb__btn--ghost:hover {
  color: var(--color-text-base);
  background: var(--color-bg-surface-high);
}
.pb__btn--primary {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.pb__btn--primary:hover { background: var(--color-primary-hover); }
.pb__btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
.pb__btn--danger { background: var(--color-error); color: #fff; border-color: var(--color-error); }
.pb__btn--danger:hover { opacity: 0.9; }
.pb__body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.pb__left {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  padding: 8px 0;
}
.pb__panel-section { padding: 8px 12px 16px; }
.pb__panel-heading {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0 0 6px;
  padding-top: 8px;
}
.pb__config-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 8px;
  font-size: 12px;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.15s;
}
.pb__config-btn:hover { color: var(--color-text-base); background: var(--color-bg-surface-high); }
.pb__config-btn--active {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.08);
  border-color: rgba(var(--color-primary-rgb), 0.2);
}
.pb__canvas {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--color-bg-base);
}
.pb__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  gap: 8px;
  color: var(--color-text-muted);
}
.pb__state--empty { text-align: center; }
.pb__empty-icon { font-size: 52px; opacity: 0.2; margin-bottom: 8px; }
.pb__empty-title { font-size: 15px; font-weight: 600; color: var(--color-text-base); margin: 0; }
.pb__empty-sub { font-size: 12px; color: var(--color-text-muted); max-width: 280px; margin: 4px 0 0; line-height: 1.6; }
.pb__right {
  width: 300px;
  flex-shrink: 0;
  background: var(--color-bg-surface);
  border-left: 1px solid var(--color-border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.pb__panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.pb__panel-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.pb__close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 16px;
}
.pb__close-btn:hover { color: var(--color-text-base); }

/* Desktop: hide all mobile-only elements */
.pb__tabs { display: none; }
.pb__mob-panel,
.pb__sheet,
.pb__backdrop { display: none; }

/* Confirm dialog */
.pb__overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pb__confirm {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 28px;
  min-width: 340px;
}
.pb__confirm-title { font-size: 15px; font-weight: 600; margin: 0 0 8px; }
.pb__confirm-sub { font-size: 13px; color: var(--color-text-muted); margin: 0 0 24px; }
.pb__confirm-actions { display: flex; gap: 8px; justify-content: flex-end; }

/* ===== MOBILE (≤767px) ===== */
@media (max-width: 767px) {
  .pb__topbar {
    height: 48px;
    padding: 0 12px;
  }
  .pb__topbar-left { gap: 8px; }
  .pb__topbar-right { gap: 8px; }
  .pb__title { font-size: 12px; }
  .pb__dirty { display: none; }
  .pb__topbar-label { display: none; }
  .pb__btn { padding: 6px 10px; }

  /* Hide desktop panels */
  .pb__left,
  .pb__right { display: none !important; }

  /* Canvas: full width, space for tab bar */
  .pb__canvas {
    padding: 12px;
    padding-bottom: 76px;
  }

  /* Bottom tab bar */
  .pb__tabs {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: var(--color-bg-surface);
    border-top: 1px solid var(--color-border);
    z-index: 90;
  }
  .pb__tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    font-size: 10px;
    font-family: inherit;
    cursor: pointer;
    position: relative;
    transition: color 0.15s;
  }
  .pb__tab .mdi { font-size: 20px; }
  .pb__tab--active { color: var(--color-primary); }
  .pb__tab-badge {
    position: absolute;
    top: 6px;
    right: calc(50% - 20px);
    background: var(--color-primary);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    border-radius: 8px;
    padding: 0 4px;
    min-width: 16px;
    text-align: center;
    line-height: 16px;
  }

  /* Mobile overlay panels (blocks / page config) */
  .pb__mob-panel {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 48px;
    left: 0;
    right: 0;
    bottom: 60px;
    background: var(--color-bg-surface);
    z-index: 80;
    overflow: hidden;
  }
  .pb__mob-panel__body {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  /* Page config menu items */
  .pb__mob-menu-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 16px;
    gap: 14px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-base);
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: background 0.15s;
  }
  .pb__mob-menu-item:active { background: var(--color-bg-surface-high); }
  .pb__mob-menu-icon { font-size: 20px; color: var(--color-text-muted); flex-shrink: 0; }
  .pb__mob-menu-text { flex: 1; }
  .pb__mob-menu-label { font-size: 14px; font-weight: 500; margin: 0; }
  .pb__mob-menu-sub { font-size: 11px; color: var(--color-text-muted); margin: 2px 0 0; }
  .pb__mob-menu-arrow { font-size: 18px; color: var(--color-text-muted); flex-shrink: 0; }

  /* Backdrop */
  .pb__backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 100;
  }

  /* Bottom sheet */
  .pb__sheet {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 60px;
    max-height: 78vh;
    background: var(--color-bg-surface);
    border-top: 1px solid var(--color-border);
    z-index: 101;
  }
  .pb__sheet-handle {
    width: 36px;
    height: 3px;
    background: var(--color-border);
    border-radius: 2px;
    margin: 10px auto 0;
    flex-shrink: 0;
  }
  .pb__sheet-body {
    flex: 1;
    overflow-y: auto;
  }

  /* Confirm dialog full width */
  .pb__confirm {
    min-width: 0;
    width: calc(100% - 32px);
  }
}
</style>
