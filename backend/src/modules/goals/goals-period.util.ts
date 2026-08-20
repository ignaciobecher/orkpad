export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'none';

export interface PeriodRange {
  periodStart: Date;
  periodEnd: Date;
}

function getDatePartsInTimezone(
  date: Date,
  timezone: string,
): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [year, month, day] = formatter.format(date).split('-').map(Number);
  return { year, month, day };
}

function getIsoWeek(
  year: number,
  month: number,
  day: number,
): { isoYear: number; isoWeek: number } {
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const isoYearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const isoWeek = Math.ceil(
    ((date.getTime() - isoYearStart.getTime()) / 86400000 + 1) / 7,
  );
  return { isoYear: date.getUTCFullYear(), isoWeek };
}

export function derivePeriodKey(
  date: Date,
  period: GoalPeriod,
  timezone = 'UTC',
): string {
  if (period === 'none') return 'total';

  const { year, month, day } = getDatePartsInTimezone(date, timezone);

  if (period === 'daily') {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  if (period === 'monthly') {
    return `${year}-${String(month).padStart(2, '0')}`;
  }

  const { isoYear, isoWeek } = getIsoWeek(year, month, day);
  return `${isoYear}-W${String(isoWeek).padStart(2, '0')}`;
}

export function derivePeriodRange(
  periodKey: string,
  period: GoalPeriod,
): PeriodRange {
  if (period === 'none') {
    return { periodStart: new Date(0), periodEnd: new Date(8640000000000000) };
  }

  if (period === 'daily') {
    const [year, month, day] = periodKey.split('-').map(Number);
    const periodStart = new Date(Date.UTC(year, month - 1, day));
    const periodEnd = new Date(Date.UTC(year, month - 1, day + 1));
    return { periodStart, periodEnd };
  }

  if (period === 'monthly') {
    const [year, month] = periodKey.split('-').map(Number);
    const periodStart = new Date(Date.UTC(year, month - 1, 1));
    const periodEnd = new Date(Date.UTC(year, month, 1));
    return { periodStart, periodEnd };
  }

  const [isoYearStr, weekStr] = periodKey.split('-W');
  const isoYear = Number(isoYearStr);
  const isoWeek = Number(weekStr);
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  const periodStart = new Date(week1Monday);
  periodStart.setUTCDate(week1Monday.getUTCDate() + (isoWeek - 1) * 7);
  const periodEnd = new Date(periodStart);
  periodEnd.setUTCDate(periodStart.getUTCDate() + 7);
  return { periodStart, periodEnd };
}

export function getPreviousPeriodKey(
  periodKey: string,
  period: GoalPeriod,
): string {
  if (period === 'none') return 'total';

  const { periodStart } = derivePeriodRange(periodKey, period);

  if (period === 'daily') {
    const prev = new Date(periodStart);
    prev.setUTCDate(prev.getUTCDate() - 1);
    return derivePeriodKey(prev, 'daily', 'UTC');
  }

  if (period === 'monthly') {
    const prev = new Date(periodStart);
    prev.setUTCMonth(prev.getUTCMonth() - 1);
    return derivePeriodKey(prev, 'monthly', 'UTC');
  }

  const prev = new Date(periodStart);
  prev.setUTCDate(prev.getUTCDate() - 7);
  return derivePeriodKey(prev, 'weekly', 'UTC');
}
