import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | SBR Frozen',
    default: 'SBR Frozen POS — Kelola Bisnis Lebih Mudah',
  },
  description: 'Sistem Point of Sales dan Business Intelligence untuk SBR Frozen. Kelola transaksi, stok, pengeluaran, dan laporan keuangan dalam satu platform.',
  keywords: ['POS', 'Point of Sale', 'Kasir', 'Inventaris', 'Laporan Keuangan', 'SBR Frozen'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SBR Frozen POS',
  },
  icons: {
    icon: [
      { url: '/icon-192.jpg', sizes: '192x192', type: 'image/jpeg' },
      { url: '/icon-512.jpg', sizes: '512x512', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/icon-192.jpg', sizes: '192x192', type: 'image/jpeg' },
    ],
    shortcut: '/icon-192.jpg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0F172A',
  colorScheme: 'dark light',
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
