/**
 * Shared currency allowlist. Used by every money DTO so currencies are
 * always picked from a pre-existing enum instead of free text.
 */
export const CURRENCIES = [
  'USD',
  'ARS',
  'EUR',
  'GBP',
  'BRL',
  'MXN',
  'CLP',
  'COP',
  'PEN',
  'UYU',
  'PYG',
  'BOB',
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];
