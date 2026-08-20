export const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

export const formatARS = (value: number): string => {
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(value)
  return `${formatted} ARS`
}

export const formatCurrency = (value: number, currencyCode: string = 'USD'): string => {
  if (currencyCode === 'ARS') return formatARS(value)
  if (!currencyCode || currencyCode === 'USD') return formatUSD(value)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(value)
}
