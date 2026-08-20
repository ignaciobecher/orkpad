import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { portfolioBuilderApi } from '@/api/portfolio/portfolio-builder.api'
import type {
  PortfolioPage,
  PortfolioSection,
  PortfolioTheme,
  PortfolioSeo,
  SectionType,
} from '@/api/portfolio/portfolio-builder.types'
import { showToast as toast } from '@/composables/useToast'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const usePortfolioBuilderStore = defineStore('portfolioBuilder', () => {
  const page = ref<PortfolioPage>({
    theme: { primaryColor: '#2563EB', colorScheme: 'dark', fontFamily: 'inter' },
    seo: { title: '', description: '', ogImageUrl: '' },
    sections: [],
  })
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const selectedSectionId = ref<string | null>(null)
  const isDirty = ref(false)

  const selectedSection = computed(() =>
    page.value.sections.find(s => s.id === selectedSectionId.value) ?? null,
  )

  const sortedSections = computed(() =>
    [...page.value.sections].sort((a, b) => a.order - b.order),
  )

  async function fetchPage() {
    loading.value = true
    error.value = null
    try {
      const res = await portfolioBuilderApi.getPage()
      page.value = res.data
      isDirty.value = false
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al cargar el portfolio'
      error.value = msg
      toast(msg, 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function savePage() {
    saving.value = true
    error.value = null
    try {
      await portfolioBuilderApi.savePage(page.value)
      isDirty.value = false
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al guardar el portfolio'
      error.value = msg
      toast(msg, 'error')
      throw err
    } finally {
      saving.value = false
    }
  }

  function addSection(
    type: SectionType,
    defaultContent: Record<string, any> = {},
    defaultSettings: Record<string, any> = {},
  ) {
    const maxOrder =
      page.value.sections.length > 0
        ? Math.max(...page.value.sections.map(s => s.order))
        : -1
    const section: PortfolioSection = {
      id: uid(),
      type,
      visible: true,
      order: maxOrder + 1,
      content: { ...defaultContent },
      settings: { ...defaultSettings },
    }
    page.value.sections.push(section)
    selectedSectionId.value = section.id
    isDirty.value = true
  }

  function removeSection(id: string) {
    const idx = page.value.sections.findIndex(s => s.id === id)
    if (idx !== -1) {
      page.value.sections.splice(idx, 1)
      if (selectedSectionId.value === id) selectedSectionId.value = null
      isDirty.value = true
    }
  }

  function updateSectionContent(id: string, content: Record<string, any>) {
    const section = page.value.sections.find(s => s.id === id)
    if (section) {
      section.content = { ...section.content, ...content }
      isDirty.value = true
    }
  }

  function updateSectionSettings(id: string, settings: Record<string, any>) {
    const section = page.value.sections.find(s => s.id === id)
    if (section) {
      section.settings = { ...section.settings, ...settings }
      isDirty.value = true
    }
  }

  function toggleSectionVisibility(id: string) {
    const section = page.value.sections.find(s => s.id === id)
    if (section) {
      section.visible = !section.visible
      isDirty.value = true
    }
  }

  function reorderSections(newSections: PortfolioSection[]) {
    page.value.sections = newSections.map((s, i) => ({ ...s, order: i }))
    isDirty.value = true
  }

  function moveSectionUp(id: string) {
    const sorted = [...page.value.sections].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex(s => s.id === id)
    if (idx <= 0) return
    const tmp = sorted[idx].order
    sorted[idx] = { ...sorted[idx], order: sorted[idx - 1].order }
    sorted[idx - 1] = { ...sorted[idx - 1], order: tmp }
    page.value.sections = sorted
    isDirty.value = true
  }

  function moveSectionDown(id: string) {
    const sorted = [...page.value.sections].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex(s => s.id === id)
    if (idx === -1 || idx >= sorted.length - 1) return
    const tmp = sorted[idx].order
    sorted[idx] = { ...sorted[idx], order: sorted[idx + 1].order }
    sorted[idx + 1] = { ...sorted[idx + 1], order: tmp }
    page.value.sections = sorted
    isDirty.value = true
  }

  async function duplicateSection(id: string) {
    try {
      const res = await portfolioBuilderApi.duplicateSection(id)
      page.value = res.data
      isDirty.value = true
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al duplicar la sección'
      toast(msg, 'error')
      throw err
    }
  }

  function updateTheme(theme: Partial<PortfolioTheme>) {
    page.value.theme = { ...page.value.theme, ...theme }
    isDirty.value = true
  }

  function updateSeo(seo: Partial<PortfolioSeo>) {
    page.value.seo = { ...page.value.seo, ...seo }
    isDirty.value = true
  }

  function selectSection(id: string | null) {
    selectedSectionId.value = id
  }

  return {
    page,
    loading,
    saving,
    error,
    selectedSectionId,
    isDirty,
    selectedSection,
    sortedSections,
    fetchPage,
    savePage,
    addSection,
    removeSection,
    updateSectionContent,
    updateSectionSettings,
    toggleSectionVisibility,
    reorderSections,
    moveSectionUp,
    moveSectionDown,
    duplicateSection,
    updateTheme,
    updateSeo,
    selectSection,
  }
})
