export interface BadgeDefinition {
  code: string
  name: string
  description: string
  icon: string
}

export const BADGES: BadgeDefinition[] = [
  { code: 'streak_7', name: 'Racha de 7 días', description: 'Racha de actividad de 7 días seguidos.', icon: 'local_fire_department' },
  { code: 'streak_30', name: 'Racha de 30 días', description: 'Racha de actividad de 30 días seguidos.', icon: 'local_fire_department' },
  { code: 'streak_100', name: 'Racha de 100 días', description: 'Racha de actividad de 100 días seguidos.', icon: 'local_fire_department' },
  { code: 'first_book', name: 'Primer recurso', description: 'Completaste tu primer libro, curso o video.', icon: 'menu_book' },
  { code: 'bookworm_5', name: 'Devorador de contenido', description: 'Completaste 5 recursos educativos.', icon: 'auto_stories' },
  { code: 'first_skill_focus', name: 'Primer foco semanal', description: 'Completaste tu primer foco de aprendizaje.', icon: 'target' },
  { code: 'skill_focus_5', name: 'Aprendiz constante', description: 'Completaste 5 focos de aprendizaje semanales.', icon: 'school' },
  { code: 'level_5', name: 'Nivel 5', description: 'Alcanzaste el nivel 5.', icon: 'military_tech' },
  { code: 'level_10', name: 'Nivel 10', description: 'Alcanzaste el nivel 10.', icon: 'military_tech' },
  { code: 'points_1000', name: '1000 puntos', description: 'Acumulaste 1000 puntos.', icon: 'workspace_premium' },
  { code: 'points_5000', name: '5000 puntos', description: 'Acumulaste 5000 puntos.', icon: 'workspace_premium' },
]
