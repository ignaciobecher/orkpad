import {
  derivePeriodKey,
  derivePeriodRange,
  getPreviousPeriodKey,
} from './goals-period.util';

describe('goals-period.util', () => {
  describe('derivePeriodKey', () => {
    it('derives a daily key in UTC', () => {
      expect(
        derivePeriodKey(new Date('2026-06-30T12:00:00Z'), 'daily', 'UTC'),
      ).toBe('2026-06-30');
    });

    it('derives a monthly key', () => {
      expect(
        derivePeriodKey(new Date('2026-06-30T12:00:00Z'), 'monthly', 'UTC'),
      ).toBe('2026-06');
    });

    it('derives an ISO weekly key', () => {
      expect(
        derivePeriodKey(new Date('2026-06-30T12:00:00Z'), 'weekly', 'UTC'),
      ).toBe('2026-W27');
    });

    it('returns "total" for period none', () => {
      expect(
        derivePeriodKey(new Date('2026-06-30T12:00:00Z'), 'none', 'UTC'),
      ).toBe('total');
    });

    it('respects a different timezone for the day boundary', () => {
      // 2026-07-01 01:00 UTC is still 2026-06-30 in UTC-negative offsets
      const date = new Date('2026-07-01T01:00:00Z');
      expect(
        derivePeriodKey(date, 'daily', 'America/Argentina/Buenos_Aires'),
      ).toBe('2026-06-30');
      expect(derivePeriodKey(date, 'daily', 'UTC')).toBe('2026-07-01');
    });
  });

  describe('derivePeriodRange', () => {
    it('computes the daily range', () => {
      const { periodStart, periodEnd } = derivePeriodRange(
        '2026-06-30',
        'daily',
      );
      expect(periodStart.toISOString()).toBe('2026-06-30T00:00:00.000Z');
      expect(periodEnd.toISOString()).toBe('2026-07-01T00:00:00.000Z');
    });

    it('computes the monthly range', () => {
      const { periodStart, periodEnd } = derivePeriodRange(
        '2026-06',
        'monthly',
      );
      expect(periodStart.toISOString()).toBe('2026-06-01T00:00:00.000Z');
      expect(periodEnd.toISOString()).toBe('2026-07-01T00:00:00.000Z');
    });

    it('computes the weekly range starting on Monday', () => {
      const { periodStart, periodEnd } = derivePeriodRange(
        '2026-W27',
        'weekly',
      );
      expect(periodStart.getUTCDay()).toBe(1); // Monday
      expect((periodEnd.getTime() - periodStart.getTime()) / 86400000).toBe(7);
    });
  });

  describe('getPreviousPeriodKey', () => {
    it('goes back one day', () => {
      expect(getPreviousPeriodKey('2026-06-30', 'daily')).toBe('2026-06-29');
    });

    it('handles month boundaries when going back a day', () => {
      expect(getPreviousPeriodKey('2026-07-01', 'daily')).toBe('2026-06-30');
    });

    it('goes back one month', () => {
      expect(getPreviousPeriodKey('2026-06', 'monthly')).toBe('2026-05');
    });

    it('handles year boundaries when going back a month', () => {
      expect(getPreviousPeriodKey('2026-01', 'monthly')).toBe('2025-12');
    });

    it('goes back one ISO week', () => {
      expect(getPreviousPeriodKey('2026-W27', 'weekly')).toBe('2026-W26');
    });
  });
});
