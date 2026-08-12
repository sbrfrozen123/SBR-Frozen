/**
 * Format number as Indonesian Rupiah currency
 * e.g. 12450000 → "Rp 12.450.000"
 */
export function formatRupiah(amount: number, showSymbol = true): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  return showSymbol ? `Rp ${formatted}` : formatted
}

/**
 * Format compact Rupiah for small spaces
 * e.g. 12450000 → "Rp 12,4Jt"
 */
export function formatRupiahCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}Rb`
  }
  return formatRupiah(amount)
}

/**
 * Parse Rupiah string back to number
 * e.g. "Rp 12.450.000" → 12450000
 */
export function parseRupiah(value: string): number {
  return Number(value.replace(/[^0-9]/g, ''))
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}
