import { format } from 'date-fns'
import { id } from 'date-fns/locale'

/**
 * Generate invoice number in format INV-YYYYMMDD-XXXX
 * Uses timestamp for uniqueness suffix
 */
export function generateInvoiceNumber(): string {
  const now = new Date()
  const dateStr = format(now, 'yyyyMMdd')
  const timeStr = now.getTime().toString().slice(-4)
  return `INV-${dateStr}-${timeStr}`
}

/**
 * Format date to Indonesian locale
 * e.g. "12 Agustus 2026"
 */
export function formatDateID(date: string | Date): string {
  return format(new Date(date), 'd MMMM yyyy', { locale: id })
}

/**
 * Format datetime to Indonesian locale
 * e.g. "12 Agustus 2026, 14:30"
 */
export function formatDateTimeID(date: string | Date): string {
  return format(new Date(date), "d MMMM yyyy, HH:mm", { locale: id })
}

/**
 * Format date short
 * e.g. "12 Ags 2026"
 */
export function formatDateShort(date: string | Date): string {
  return format(new Date(date), 'd MMM yyyy', { locale: id })
}

/**
 * Get start and end of today
 */
export function getTodayRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

/**
 * Get start and end of current month
 */
export function getMonthRange(date = new Date()): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

/**
 * Check if a date is overdue (past due_date)
 */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

/**
 * Get days until due date (negative = overdue)
 */
export function daysUntilDue(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  const diff = due.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
