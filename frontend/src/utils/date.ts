import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea una fecha en formato legible
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return format(d, 'dd MMM. yyyy', { locale: es })
}

/**
 * Formatea una fecha relativa (hace 2 días)
 */
export const formatRelative = (date: string | Date): string => {
  const d = new Date(date)
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

/**
 * Verifica si una fecha está próxima a vencer (menos de 7 días)
 */
export const isExpiringSoon = (date: string | Date): boolean => {
  const d = new Date(date)
  const diff = differenceInDays(d, new Date())
  return diff >= 0 && diff <= 7
}

/**
 * Retorna los días restantes hasta una fecha
 */
export const daysUntil = (date: string | Date): number => {
  return differenceInDays(new Date(date), new Date())
}

/**
 * Formatea una fecha "de calendario" (ej. scheduledDate de un post) leyendo los
 * componentes en UTC en vez de hora local. El backend fija estas fechas a
 * mediodía UTC para que el día no cambie según el timezone del navegador; usar
 * format() en hora local volvería a introducir ese desfasaje de un día.
 */
export const formatCalendarDate = (date: string | Date): string => {
  const d = new Date(date)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Convierte una fecha almacenada (pineada a mediodía UTC) al string YYYY-MM-DD
 * que espera un <input type="date">, sin desfasarse por el timezone local.
 */
export const toDateInputValue = (date: string | Date): string => {
  const d = new Date(date)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
