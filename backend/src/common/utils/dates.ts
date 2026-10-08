/**
 * Date-only values (YYYY-MM-DD from <input type="date">) parse as midnight
 * UTC in `new Date()`, which renders as the *previous* day in timezones
 * behind UTC (e.g. America/Argentina). Pinning them to noon UTC keeps the
 * calendar day stable for display via UTC getters, regardless of the
 * viewer's timezone.
 *
 * Only for calendar dates. Never use on real timestamps (createdAt,
 * session start/end, etc.).
 */
export function normalizeCalendarDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const d = value instanceof Date ? new Date(value.getTime()) : new Date(value as any);
  if (isNaN(d.getTime())) return undefined;
  d.setUTCHours(12, 0, 0, 0);
  return d;
}

/** Today at noon UTC — for server-generated calendar dates. */
export function todayNoonUTC(): Date {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  return d;
}
