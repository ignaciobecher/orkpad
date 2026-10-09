import type { Document } from '@/api/docs/docs.types'

export interface ExplorerFolder {
  id: string
  name: string
  parentId: string
  itemCount: number
}

export interface StoredFilePayload {
  kind: 'file'
  mimeType: string
  extension: string
  fileName: string
  size: number
  encoding: 'text' | 'data-url' | 'file-ref'
  text?: string
  data?: string
  fileId?: string
}

export function normalizeFolderPath(path?: string) {
  if (!path) return ''
  return path
    .split('/')
    .map(segment => segment.trim())
    .filter(Boolean)
    .join('/')
}

export function joinFolderPath(parentPath: string, folderName: string) {
  return normalizeFolderPath([parentPath, folderName].filter(Boolean).join('/'))
}

export function getFolderName(path: string) {
  const normalized = normalizeFolderPath(path)
  const parts = normalized.split('/').filter(Boolean)
  return parts.at(-1) || 'Root'
}

export function isFolderDocument(doc: Document) {
  return doc.tags?.includes('system:folder') ?? false
}

export function isFileDocument(doc: Document) {
  return !isFolderDocument(doc)
}

export function getDirectChildrenFolders(docs: Document[], currentPath: string): ExplorerFolder[] {
  const normalizedCurrent = normalizeFolderPath(currentPath)
  const folderMap = new Map<string, ExplorerFolder>()

  docs.forEach((doc) => {
    const folderPath = isFolderDocument(doc)
      ? joinFolderPath(doc.folderId || '', doc.title)
      : normalizeFolderPath(doc.folderId)

    if (!folderPath) return

    const parts = folderPath.split('/')
    const currentParts = normalizedCurrent ? normalizedCurrent.split('/') : []
    if (parts.length <= currentParts.length) return

    const prefix = parts.slice(0, currentParts.length).join('/')
    if (prefix !== normalizedCurrent) return

    const nextPath = parts.slice(0, currentParts.length + 1).join('/')
    if (!folderMap.has(nextPath)) {
      folderMap.set(nextPath, {
        id: nextPath,
        name: parts[currentParts.length],
        parentId: normalizedCurrent,
        itemCount: 0,
      })
    }
    folderMap.get(nextPath)!.itemCount += 1
  })

  return [...folderMap.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function getDocumentsInFolder(docs: Document[], currentPath: string) {
  const normalizedCurrent = normalizeFolderPath(currentPath)
  return docs
    .filter((doc) => normalizeFolderPath(doc.folderId) === normalizedCurrent)
    .sort((a, b) => {
      if (isFolderDocument(a) !== isFolderDocument(b)) {
        return isFolderDocument(a) ? -1 : 1
      }
      return a.title.localeCompare(b.title)
    })
}

export function buildBreadcrumbs(path: string) {
  const normalized = normalizeFolderPath(path)
  if (!normalized) return [{ id: '', label: 'Root' }]

  const parts = normalized.split('/')
  return [
    { id: '', label: 'Root' },
    ...parts.map((part, index) => ({
      id: parts.slice(0, index + 1).join('/'),
      label: part,
    })),
  ]
}

export function getFileExtension(fileName: string) {
  return fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : ''
}

export async function fileToDocumentPayload(file: File): Promise<StoredFilePayload> {
  const extension = getFileExtension(file.name)
  const mimeType = file.type || 'application/octet-stream'

  if (extension === 'md') {
    const text = await file.text()
    return {
      kind: 'file',
      mimeType: 'text/markdown',
      extension,
      fileName: file.name,
      size: file.size,
      encoding: 'text',
      text,
    }
  }

  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  return {
    kind: 'file',
    mimeType,
    extension,
    fileName: file.name,
    size: file.size,
    encoding: 'data-url',
    data,
  }
}

export function parseStoredFile(doc: Document): StoredFilePayload | null {
  if (!doc.content) return null
  try {
    const parsed = JSON.parse(doc.content) as StoredFilePayload
    if (parsed?.kind === 'file') return parsed
    return null
  } catch {
    return null
  }
}

export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']

export function getDocumentIcon(doc: Document) {
  if (isFolderDocument(doc)) return 'folder'
  const payload = parseStoredFile(doc)
  const extension = payload?.extension || getFileExtension(doc.title)
  if (VIDEO_EXTENSIONS.includes(extension)) return 'movie'
  if (extension === 'md') return 'description'
  if (extension === 'pdf') return 'picture_as_pdf'
  if (['doc', 'docx'].includes(extension)) return 'article'
  if (['xls', 'xlsx', 'csv'].includes(extension)) return 'table_chart'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) return 'image'
  if (['zip', 'rar', '7z'].includes(extension)) return 'folder_zip'
  return 'draft'
}

export function getFileKindLabel(doc: Document): string {
  if (isFolderDocument(doc)) return 'Carpeta'
  const payload = parseStoredFile(doc)
  const extension = (payload?.extension || getFileExtension(doc.title)).toLowerCase()
  if (VIDEO_EXTENSIONS.includes(extension)) return 'Video'
  if (extension === 'pdf') return 'Documento PDF'
  if (['doc', 'docx'].includes(extension)) return 'Documento de Word'
  if (['xls', 'xlsx'].includes(extension)) return 'Hoja de cálculo'
  if (extension === 'csv') return 'CSV'
  if (extension === 'md') return 'Markdown'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) return 'Imagen'
  if (['zip', 'rar', '7z'].includes(extension)) return 'Archivo comprimido'
  if (extension) return `Archivo .${extension}`
  return 'Archivo'
}

export function getFileIconColor(doc: Document): string {
  if (isFolderDocument(doc)) return '#FFC107'
  const payload = parseStoredFile(doc)
  const extension = (payload?.extension || getFileExtension(doc.title)).toLowerCase()
  if (VIDEO_EXTENSIONS.includes(extension)) return '#FF5722'
  if (extension === 'pdf') return '#F44336'
  if (['doc', 'docx'].includes(extension)) return '#2196F3'
  if (['xls', 'xlsx', 'csv'].includes(extension)) return '#4CAF50'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) return '#9C27B0'
  if (extension === 'md') return '#9E9E9E'
  return 'var(--color-text-muted)'
}

export function getStoredFileSize(doc: Document): number | null {
  const payload = parseStoredFile(doc)
  return payload?.size ?? null
}

export function formatBytes(size: number | null | undefined): string {
  if (size === null || size === undefined) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

/** Todas las rutas de carpetas existentes (ordenadas), para el árbol lateral. */
export function getAllFolderPaths(docs: Document[]): string[] {
  const paths = new Set<string>()
  docs.forEach((doc) => {
    const folderPath = isFolderDocument(doc)
      ? joinFolderPath(doc.folderId || '', doc.title)
      : normalizeFolderPath(doc.folderId)
    if (!folderPath) return
    const parts = folderPath.split('/')
    for (let i = 1; i <= parts.length; i++) {
      paths.add(parts.slice(0, i).join('/'))
    }
  })
  return [...paths].sort((a, b) => a.localeCompare(b))
}
