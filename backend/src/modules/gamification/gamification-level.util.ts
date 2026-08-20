import { POINTS_PER_LEVEL } from './gamification.constants';

export function computeLevel(totalPoints: number): number {
  return 1 + Math.floor(Math.max(totalPoints, 0) / POINTS_PER_LEVEL);
}

export function pointsForNextLevel(totalPoints: number): {
  current: number;
  next: number;
  progress: number;
} {
  const level = computeLevel(totalPoints);
  const floor = (level - 1) * POINTS_PER_LEVEL;
  const ceil = level * POINTS_PER_LEVEL;
  const current = totalPoints - floor;
  const next = ceil - floor;
  return { current, next, progress: current / next };
}
