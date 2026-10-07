export interface CurrencyOption {
  code: string
  label: string
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', label: 'USD — Dólar estadounidense' },
  { code: 'ARS', label: 'ARS — Peso argentino' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — Libra esterlina' },
  { code: 'BRL', label: 'BRL — Real brasileño' },
  { code: 'MXN', label: 'MXN — Peso mexicano' },
  { code: 'CLP', label: 'CLP — Peso chileno' },
  { code: 'COP', label: 'COP — Peso colombiano' },
  { code: 'PEN', label: 'PEN — Sol peruano' },
  { code: 'UYU', label: 'UYU — Peso uruguayo' },
  { code: 'PYG', label: 'PYG — Guaraní' },
  { code: 'BOB', label: 'BOB — Boliviano' },
]

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code)
