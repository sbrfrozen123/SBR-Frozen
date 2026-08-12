import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | SBR POS System',
    default: 'SBR POS System — Kelola Bisnis Lebih Mudah',
  },
  description: 'Sistem Point of Sales dan Business Intelligence untuk SBR Frozen. Kelola transaksi, stok, pengeluaran, dan laporan keuangan dalam satu platform.',
  keywords: ['POS', 'Point of Sale', 'Kasir', 'Inventaris', 'Laporan Keuangan', 'SBR Frozen'],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#E91E8C',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
