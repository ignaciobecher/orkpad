import type { MarketingNetwork, MarketingStatus } from './marketing-shared.types'
import type { MarketingPostFormat } from './marketing-posts.types'

export interface PreviewImportRow {
  rowIndex: number
  dia: string
  red: MarketingNetwork
  formato: MarketingPostFormat
  contenidoTitulo: string
  descripcion?: string
  status?: MarketingStatus
  attachmentUrl?: string
  analysisNotes?: string
  errors?: string[]
  isValid: boolean
}

export interface PreviewImportResponse {
  rows: PreviewImportRow[]
  totalRows: number
  validRows: number
  invalidRows: number
}

export interface ImportPostRowDto {
  scheduledDate: string
  network: MarketingNetwork
  format: MarketingPostFormat
  title: string
  copyText?: string
  status?: MarketingStatus
  ideaId?: string
  attachmentUrl?: string
  analysisNotes?: string
}

export interface ImportPostsDto {
  posts: ImportPostRowDto[]
}
