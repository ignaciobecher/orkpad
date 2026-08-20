export type MarketingNetwork = 'linkedin' | 'instagram' | 'tiktok'

export type MarketingStatus = 'idea' | 'borrador' | 'listo' | 'publicado'

export const NETWORK_LABELS: Record<MarketingNetwork, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  tiktok: 'TikTok',
}

export const NETWORK_COLORS: Record<MarketingNetwork, string> = {
  linkedin: '#0A66C2',
  instagram: '#E1306C',
  tiktok: '#69C9D0',
}

export const STATUS_LABELS: Record<MarketingStatus, string> = {
  idea: 'Idea',
  borrador: 'Borrador',
  listo: 'Listo',
  publicado: 'Publicado',
}

export const STATUS_COLORS: Record<MarketingStatus, string> = {
  idea: '#9CA3AF',
  borrador: '#F59E0B',
  listo: '#3B82F6',
  publicado: '#10B981',
}

export const NETWORK_OPTIONS: { value: MarketingNetwork; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
]

export const STATUS_OPTIONS: { value: MarketingStatus; label: string }[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'listo', label: 'Listo' },
  { value: 'publicado', label: 'Publicado' },
]
