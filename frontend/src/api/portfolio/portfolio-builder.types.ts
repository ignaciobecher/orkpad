export type SectionType =
  | 'hero'
  | 'about'
  | 'skills'
  | 'projects'
  | 'services'
  | 'testimonials'
  | 'experience'
  | 'education'
  | 'links'
  | 'contact'
  | 'stats'
  | 'gallery'
  | 'custom'

export interface PortfolioTheme {
  primaryColor: string
  colorScheme: 'dark' | 'light'
  fontFamily: string
}

export interface PortfolioSeo {
  title?: string
  description?: string
  ogImageUrl?: string
}

export interface PortfolioSection {
  id: string
  type: SectionType
  visible: boolean
  order: number
  content: Record<string, any>
  settings: Record<string, any>
}

export interface PortfolioPage {
  theme: PortfolioTheme
  seo: PortfolioSeo
  sections: PortfolioSection[]
}

export interface BlockMeta {
  type: SectionType
  label: string
  icon: string
  description: string
  defaultContent: Record<string, any>
  defaultSettings: Record<string, any>
}

export const SECTION_BLOCKS: BlockMeta[] = [
  {
    type: 'hero',
    label: 'Hero',
    icon: 'mdi-home-outline',
    description: 'Encabezado principal con foto, nombre y presentación',
    defaultContent: {
      useWorkspaceData: true,
      customName: '',
      customHeadline: '',
      customBio: '',
      ctaLabel: 'Contáctame',
      ctaUrl: '#contacto',
      showSocialLinks: true,
      showAvailability: true,
    },
    defaultSettings: { layout: 'centered', showBanner: false },
  },
  {
    type: 'about',
    label: 'Sobre mí',
    icon: 'mdi-account-outline',
    description: 'Sección de presentación con texto enriquecido',
    defaultContent: { title: 'Sobre mí', body: '', imageUrl: '' },
    defaultSettings: { layout: 'text-only' },
  },
  {
    type: 'skills',
    label: 'Habilidades',
    icon: 'mdi-lightning-bolt-outline',
    description: 'Grid de habilidades y tecnologías',
    defaultContent: { title: 'Mis habilidades', useWorkspaceSkills: true, customSkills: [] },
    defaultSettings: { layout: 'chips' },
  },
  {
    type: 'projects',
    label: 'Proyectos',
    icon: 'mdi-folder-outline',
    description: 'Grid de proyectos destacados del workspace',
    defaultContent: { title: 'Proyectos', subtitle: '' },
    defaultSettings: { layout: 'grid', columns: 3, limit: 6 },
  },
  {
    type: 'services',
    label: 'Servicios',
    icon: 'mdi-briefcase-outline',
    description: 'Lista de servicios y precios del workspace',
    defaultContent: { title: 'Mis servicios', subtitle: '' },
    defaultSettings: { layout: 'grid', showPrice: true },
  },
  {
    type: 'testimonials',
    label: 'Testimonios',
    icon: 'mdi-comment-quote-outline',
    description: 'Testimonios de clientes del workspace',
    defaultContent: { title: 'Lo que dicen mis clientes' },
    defaultSettings: { layout: 'grid', showRating: true },
  },
  {
    type: 'experience',
    label: 'Experiencia',
    icon: 'mdi-timeline-outline',
    description: 'Línea de tiempo de experiencia laboral',
    defaultContent: {
      title: 'Experiencia',
      items: [{ id: '1', company: '', role: '', period: '', description: '', current: false }],
    },
    defaultSettings: {},
  },
  {
    type: 'education',
    label: 'Educación',
    icon: 'mdi-school-outline',
    description: 'Formación académica y certificaciones',
    defaultContent: {
      title: 'Educación',
      items: [{ id: '1', institution: '', degree: '', period: '', description: '' }],
    },
    defaultSettings: {},
  },
  {
    type: 'links',
    label: 'Links',
    icon: 'mdi-link-variant',
    description: 'Lista de links importantes (estilo Linktree)',
    defaultContent: {
      title: 'Mis links',
      items: [{ id: '1', label: 'Mi sitio web', url: '', icon: 'mdi-web', description: '' }],
    },
    defaultSettings: { layout: 'list' },
  },
  {
    type: 'stats',
    label: 'Estadísticas',
    icon: 'mdi-chart-bar',
    description: 'KPIs y métricas destacadas',
    defaultContent: { title: '', useWorkspaceStats: true, customStats: [] },
    defaultSettings: {},
  },
  {
    type: 'gallery',
    label: 'Galería',
    icon: 'mdi-image-multiple-outline',
    description: 'Galería de imágenes',
    defaultContent: { title: 'Galería', images: [] },
    defaultSettings: { columns: 3 },
  },
  {
    type: 'contact',
    label: 'Contacto',
    icon: 'mdi-email-outline',
    description: 'Formulario de contacto',
    defaultContent: {
      title: '¿Trabajamos juntos?',
      subtitle: 'Enviame un mensaje y te respondo pronto.',
    },
    defaultSettings: {},
  },
  {
    type: 'custom',
    label: 'Bloque libre',
    icon: 'mdi-code-tags',
    description: 'Texto enriquecido o HTML personalizado',
    defaultContent: { title: '', body: '' },
    defaultSettings: {},
  },
]

export const SECTION_LABELS: Record<SectionType, string> = Object.fromEntries(
  SECTION_BLOCKS.map(b => [b.type, b.label]),
) as Record<SectionType, string>
