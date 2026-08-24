import { format, isValid, parse } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Calculate formatted date distance in Spanish
 * @param date - The date to format short
 * @returns Formatted date distance
 */
export function formatDateShort(date: Date | number): string {
  return format(date, "PPP", { locale: es })
}

/**
 * Parse a date string to a Date object.
 * Accepts "yyyy-MM-dd" or "yyyy-MM-dd'T'HH:mm" formats.
 * @param value - The date string to parse
 * @returns Date object or undefined if invalid
 */
export function parseDateString(value: string): Date | undefined {
  if (!value) return undefined

  const hasTime = value.includes("T")
  const date = parse(
    value,
    hasTime ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd",
    new Date()
  )

  if (!isValid(date)) return undefined

  return date
}

/**
 * Format a date for display in the UI.
 * @param date - Date object or string to format
 * @param withHours - Whether to include time
 * @returns Formatted date string (e.g. "1 jul 2026" or "1 jul 2026 14:30")
 */
export function formatDateDisplay(
  date: Date | string,
  withHours: boolean
): string {
  const dateObj = typeof date === "string" ? parseDateString(date) : date

  if (!dateObj || !isValid(dateObj)) return ""

  return format(dateObj, withHours ? "PPP HH:mm" : "PPP", { locale: es })
}

/**
 * Format a date to a form-compatible value string.
 * @param date - Date object to format
 * @param withHours - Whether to include time
 * @returns Formatted value string ("yyyy-MM-dd" or "yyyy-MM-dd'T'HH:mm")
 */
export function formatDateValue(date: Date, withHours: boolean): string {
  if (!isValid(date)) return ""

  return format(date, withHours ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd")
}
