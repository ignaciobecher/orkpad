export interface BadgeCondition {
  metric:
    | 'bestStreakDays'
    | 'level'
    | 'totalPoints'
    | 'resourcesCompleted'
    | 'skillFociCompleted'
    | 'goalsCompleted';
  threshold: number;
}

export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  condition: BadgeCondition;
}

export const BADGES: BadgeDefinition[] = [
  {
    code: 'streak_7',
    name: 'Racha de 7 días',
    description: 'Mantuviste una racha de actividad de 7 días seguidos.',
    icon: 'local_fire_department',
    condition: { metric: 'bestStreakDays', threshold: 7 },
  },
  {
    code: 'streak_30',
    name: 'Racha de 30 días',
    description: 'Mantuviste una racha de actividad de 30 días seguidos.',
    icon: 'local_fire_department',
    condition: { metric: 'bestStreakDays', threshold: 30 },
  },
  {
    code: 'streak_100',
    name: 'Racha de 100 días',
    description: 'Mantuviste una racha de actividad de 100 días seguidos.',
    icon: 'local_fire_department',
    condition: { metric: 'bestStreakDays', threshold: 100 },
  },
  {
    code: 'first_book',
    name: 'Primer recurso completado',
    description: 'Completaste tu primer libro, curso o video educativo.',
    icon: 'menu_book',
    condition: { metric: 'resourcesCompleted', threshold: 1 },
  },
  {
    code: 'bookworm_5',
    name: 'Devorador de contenido',
    description: 'Completaste 5 recursos educativos.',
    icon: 'auto_stories',
    condition: { metric: 'resourcesCompleted', threshold: 5 },
  },
  {
    code: 'first_skill_focus',
    name: 'Primer foco semanal',
    description: 'Completaste tu primer foco de aprendizaje semanal.',
    icon: 'target',
    condition: { metric: 'skillFociCompleted', threshold: 1 },
  },
  {
    code: 'skill_focus_5',
    name: 'Aprendiz constante',
    description: 'Completaste 5 focos de aprendizaje semanales.',
    icon: 'school',
    condition: { metric: 'skillFociCompleted', threshold: 5 },
  },
  {
    code: 'level_5',
    name: 'Nivel 5',
    description: 'Alcanzaste el nivel 5.',
    icon: 'military_tech',
    condition: { metric: 'level', threshold: 5 },
  },
  {
    code: 'level_10',
    name: 'Nivel 10',
    description: 'Alcanzaste el nivel 10.',
    icon: 'military_tech',
    condition: { metric: 'level', threshold: 10 },
  },
  {
    code: 'points_1000',
    name: '1000 puntos',
    description: 'Acumulaste 1000 puntos.',
    icon: 'workspace_premium',
    condition: { metric: 'totalPoints', threshold: 1000 },
  },
  {
    code: 'points_5000',
    name: '5000 puntos',
    description: 'Acumulaste 5000 puntos.',
    icon: 'workspace_premium',
    condition: { metric: 'totalPoints', threshold: 5000 },
  },
];
