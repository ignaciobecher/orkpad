<template>
  <div class="docs-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Docs</h1>
        <div class="header-filters">
          <div class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input type="text" v-model="filters.search" placeholder="BUSCAR ARCHIVO O CARPETA..." @input="handleSearch" />
          </div>
        </div>
      </div>
      <div class="header-right">
        <input ref="fileInput" type="file" class="hidden-file-input" accept=".md,.doc,.docx,.xls,.xlsx,.pdf" multiple @change="handleFileUpload" />
        <w-button variant="secondary" @click="openFolderModal = true">
          <span class="material-symbols-outlined mr-2">create_new_folder</span>
          NUEVA CARPETA
        </w-button>
        <w-button variant="primary" @click="triggerUpload">
          <span class="material-symbols-outlined mr-2">upload_file</span>
          SUBIR ARCHIVOS
        </w-button>
      </div>
    </header>

    <section class="explorer-shell">
      <aside class="explorer-sidebar">
        <div class="sidebar-header">EXPLORADOR</div>
        <button class="sidebar-item" :class="{ active: currentFolderPath === '' }" @click="navigateToFolder('')">
          <span class="material-symbols-outlined">home</span>
          <span>Root</span>
        </button>
        <button
          v-for="folder in allFolders"
          :key="folder.id"
          class="sidebar-item"
          :class="{ active: currentFolderPath === folder.id }"
          @click="navigateToFolder(folder.id)"
        >
          <span class="material-symbols-outlined">folder</span>
          <span>{{ folder.name }}</span>
        </button>
      </aside>

      <main class="explorer-main">
        <div class="breadcrumbs">
          <button
            v-for="crumb in breadcrumbs"
            :key="crumb.id"
            class="breadcrumb"
            @click="navigateToFolder(crumb.id)"
          >
            {{ crumb.label }}
          </button>
        </div>

        <section class="folders-section">
          <div class="section-caption">CARPETAS</div>
          <div v-if="visibleFolders.length" class="folder-grid">
            <button
              v-for="folder in visibleFolders"
              :key="folder.id"
              class="folder-card"
              @dblclick="navigateToFolder(folder.id)"
              @click="selectedFolderId = folder.id"
            >
              <span class="material-symbols-outlined folder-card__icon">folder</span>
              <span class="folder-card__name">{{ folder.name }}</span>
              <span class="folder-card__meta">{{ folder.itemCount }} items</span>
            </button>
          </div>
          <w-empty-state
            v-else
            title="Sin carpetas"
            description="Crea una carpeta para empezar a organizar la documentación como un sistema operativo."
          />
        </section>

        <section class="files-section">
          <div class="section-caption">ARCHIVOS</div>
          <w-card class="no-padding">
            <w-table :headers="headers" :items="visibleFiles" :loading="loading" empty-message="No hay archivos en esta carpeta.">
              <template #item-title="{ item }">
                <button class="doc-link" @click="openDocument(item)">
                  <span class="material-symbols-outlined">{{ getDocumentIcon(item) }}</span>
                  <span>{{ item.title }}</span>
                </button>
              </template>
              <template #item-createdAt="{ item }">
                <span>{{ formatDateTime(item.createdAt) }}</span>
              </template>
              <template #item-actions="{ item }">
                <div class="table-actions">
                  <button class="action-btn" @click.stop="openDocument(item)">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                  <button class="action-btn text-error" @click.stop="confirmDelete(item)">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </template>
            </w-table>
          </w-card>
        </section>
      </main>
    </section>

    <div v-if="openFolderModal" class="modal-overlay" @click.self="openFolderModal = false">
      <div class="modal-box">
        <h3 class="modal-title">Nueva carpeta</h3>
        <div class="modal-form">
          <label>Nombre</label>
          <input v-model="newFolderName" type="text" placeholder="Ej: Contratos, Finanzas, IA" />
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="openFolderModal = false">Cancelar</button>
          <button class="btn-primary" :disabled="loading" @click="createFolder">Crear carpeta</button>
        </div>
      </div>
    </div>

    <div v-if="selectedDocument" class="modal-overlay" @click.self="selectedDocument = null">
      <div class="modal-box modal-box--large">
        <div class="doc-preview__header">
          <div>
            <h3 class="modal-title">{{ selectedDocument.title }}</h3>
            <p class="doc-preview__meta">{{ previewMeta }}</p>
          </div>
          <div class="doc-preview__actions">
            <button class="btn-secondary" @click="downloadSelectedDocument">Descargar</button>
            <button class="btn-secondary" @click="selectedDocument = null">Cerrar</button>
          </div>
        </div>

        <div class="doc-preview__body">
          <pre v-if="selectedDocumentPayload?.encoding === 'text'" class="doc-text-preview">{{ selectedDocumentPayload.text }}</pre>
          <div v-else class="doc-binary-preview">
            <span class="material-symbols-outlined">{{ getDocumentIcon(selectedDocument) }}</span>
            <p>Archivo importado correctamente.</p>
            <p class="doc-preview__hint">Puedes descargarlo desde aquí cuando lo necesites.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'pinia'
import type { Document } from '@/api/docs/docs.types'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'
import WTable from '@/components/ui/WTable.vue'
import { useDocsStore } from '@/stores/docs.store'
import {
  buildBreadcrumbs,
  fileToDocumentPayload,
  getDirectChildrenFolders,
  getDocumentIcon,
  getDocumentsInFolder,
  getFileExtension,
  isFileDocument,
  isFolderDocument,
  normalizeFolderPath,
  parseStoredFile,
  type StoredFilePayload,
} from '@/utils/docs-explorer'

export default defineComponent({
  name: 'DocsPage',
  components: { WButton, WTable, WCard, WEmptyState },
  data() {
    return {
      currentFolderPath: '',
      openFolderModal: false,
      newFolderName: '',
      selectedFolderId: '',
      selectedDocument: null as Document | null,
      headers: [
        { key: 'title', label: 'NOMBRE' },
        { key: 'createdAt', label: 'CREADO' },
        { key: 'actions', label: 'ACCIONES', width: '100px' }
      ]
    }
  },
  computed: {
    ...mapState(useDocsStore, ['items', 'loading', 'filters']),
    visibleFolders() {
      return getDirectChildrenFolders(this.items, this.currentFolderPath)
    },
    allFolders() {
      return getDirectChildrenFolders(this.items, '')
    },
    visibleFiles() {
      return getDocumentsInFolder(this.items, this.currentFolderPath).filter(isFileDocument)
    },
    breadcrumbs() {
      return buildBreadcrumbs(this.currentFolderPath)
    },
    selectedDocumentPayload(): StoredFilePayload | null {
      return this.selectedDocument ? parseStoredFile(this.selectedDocument) : null
    },
    previewMeta() {
      if (!this.selectedDocument || !this.selectedDocumentPayload) return 'Documento interno'
      const payload = this.selectedDocumentPayload
      const sizeKb = Math.max(1, Math.round(payload.size / 1024))
      return `${payload.extension.toUpperCase()} · ${sizeKb} KB · ${payload.mimeType}`
    }
  },
  methods: {
    ...mapActions(useDocsStore, ['fetchAll', 'create', 'remove']),
    getDocumentIcon,
    handleSearch() {
      this.fetchAll()
    },
    navigateToFolder(folderPath: string) {
      this.currentFolderPath = normalizeFolderPath(folderPath)
      this.selectedFolderId = this.currentFolderPath
    },
    triggerUpload() {
      (this.$refs.fileInput as HTMLInputElement | undefined)?.click()
    },
    async createFolder() {
      const folderName = this.newFolderName.trim()
      if (!folderName) return

      await this.create({
        title: folderName,
        folderId: this.currentFolderPath,
        tags: ['system:folder']
      })

      this.newFolderName = ''
      this.openFolderModal = false
    },
    async handleFileUpload(event: Event) {
      const input = event.target as HTMLInputElement
      const files = Array.from(input.files ?? [])
      if (!files.length) return

      for (const file of files) {
        const payload = await fileToDocumentPayload(file)
        await this.create({
          title: file.name,
          folderId: this.currentFolderPath,
          tags: [
            'system:file',
            `extension:${getFileExtension(file.name)}`,
            `mime:${payload.mimeType}`
          ],
          content: JSON.stringify(payload)
        })
      }

      input.value = ''
    },
    openDocument(doc: Document) {
      this.selectedDocument = doc
    },
    async confirmDelete(doc: Document) {
      const label = isFolderDocument(doc) ? 'esta carpeta' : 'este archivo'
      if (confirm(`¿Seguro que quieres eliminar ${label}?`)) {
        await this.remove(doc._id)
        if (this.selectedDocument?._id === doc._id) this.selectedDocument = null
      }
    },
    formatDateTime(value: string) {
      return new Date(value).toLocaleString()
    },
    downloadSelectedDocument() {
      if (!this.selectedDocument || !this.selectedDocumentPayload) return
      const payload = this.selectedDocumentPayload

      if (payload.encoding === 'text') {
        const blob = new Blob([payload.text ?? ''], { type: payload.mimeType })
        const url = URL.createObjectURL(blob)
        this.triggerBrowserDownload(url, payload.fileName)
        return
      }

      this.triggerBrowserDownload(payload.data ?? '', payload.fileName)
    },
    triggerBrowserDownload(url: string, fileName: string) {
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    },
  },
  mounted() {
    this.fetchAll()
  }
})
</script>

<style scoped>
.docs-page { padding: 32px; flex-grow: 1; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.header-left { display: flex; align-items: center; gap: 32px; }
.header-right { display: flex; gap: 12px; }
.header-filters { display: flex; align-items: center; gap: 16px; }
.page-title { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); }
.search-box { position: relative; width: 320px; }
.search-box span { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--color-text-muted); }
.search-box input { width: 100%; background-color: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 8px 12px 8px 36px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-base); outline: none; }
.explorer-shell { display: grid; grid-template-columns: 240px 1fr; gap: 20px; min-height: 70vh; }
.explorer-sidebar { border: 1px solid var(--color-border); background: var(--color-bg-surface); padding: 12px; }
.sidebar-header { margin-bottom: 8px; font-family: var(--font-mono); font-size: 11px; letter-spacing: var(--letter-spacing-caps); color: var(--color-text-muted); text-transform: uppercase; }
.sidebar-item { width: 100%; display: flex; align-items: center; gap: 8px; padding: 10px; background: transparent; border: 0; color: var(--color-text-base); cursor: pointer; text-align: left; }
.sidebar-item.active, .sidebar-item:hover { background: rgba(255,255,255,0.04); }
@media (max-width: 1024px) {
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .explorer-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .docs-page {
    padding: 16px;
  }
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    margin-bottom: 24px;
  }
  .header-filters {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  .search-box {
    width: 100%;
  }
  .header-right {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  .header-right :deep(.w-button) {
    width: 100%;
  }
}

.explorer-main { display: flex; flex-direction: column; gap: 20px; }
.breadcrumbs { display: flex; flex-wrap: wrap; gap: 8px; }
.breadcrumb { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-muted); padding: 6px 10px; cursor: pointer; font-family: var(--font-mono); font-size: 11px; }
.breadcrumb:hover { color: var(--color-text-base); border-color: var(--color-primary); }
.section-caption { margin-bottom: 10px; font-family: var(--font-mono); font-size: 11px; letter-spacing: var(--letter-spacing-caps); color: var(--color-text-muted); text-transform: uppercase; }
.folder-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.folder-card { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 16px; border: 1px solid var(--color-border); background: var(--color-bg-surface); cursor: pointer; text-align: left; }
.folder-card:hover { border-color: var(--color-primary); }
.folder-card__icon { font-size: 26px; color: var(--color-primary); }
.folder-card__name { color: var(--color-text-base); font-weight: 500; }
.folder-card__meta { color: var(--color-text-muted); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; }
.doc-link { display: inline-flex; align-items: center; gap: 8px; background: none; border: 0; padding: 0; color: var(--color-text-base); cursor: pointer; }
.hidden-file-input { display: none; }
.no-padding { padding: 0 !important; }
.table-actions { display: flex; gap: 8px; }
.action-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; padding: 4px; }
.action-btn:hover { color: var(--color-text-base); }
.text-error { color: var(--color-error) !important; }
.mr-2 { margin-right: 8px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { width: 100%; max-width: 480px; padding: 24px; background: var(--color-bg-surface); border: 1px solid var(--color-border); }
.modal-box--large { max-width: 860px; }
.modal-title { margin: 0 0 12px; font-family: var(--font-body); font-size: 18px; color: var(--color-text-base); }
.modal-form { display: flex; flex-direction: column; gap: 8px; }
.modal-form label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-text-muted); }
.modal-form input { background: var(--color-bg-surface-highest); border: 1px solid var(--color-border); padding: 10px 12px; color: var(--color-text-base); outline: none; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-primary, .btn-secondary { padding: 9px 16px; border: 1px solid var(--color-border); cursor: pointer; }
.btn-primary { background: var(--color-primary); border-color: var(--color-primary); color: white; }
.btn-secondary { background: transparent; color: var(--color-text-base); }
.doc-preview__header { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.doc-preview__meta { margin: 0; color: var(--color-text-muted); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; }
.doc-preview__actions { display: flex; gap: 10px; align-items: flex-start; }
.doc-preview__body { min-height: 320px; border: 1px solid var(--color-border); background: var(--color-bg-surface-highest); padding: 16px; overflow: auto; }
.doc-text-preview { white-space: pre-wrap; margin: 0; color: var(--color-text-base); font-family: var(--font-mono); line-height: 1.5; }
.doc-binary-preview { min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--color-text-muted); }
.doc-binary-preview .material-symbols-outlined { font-size: 48px; color: var(--color-primary); }
.doc-preview__hint { margin: 0; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; }
</style>
