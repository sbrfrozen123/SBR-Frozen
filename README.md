# SBR POS System

**Platform Point of Sales & Business Intelligence** untuk SBR Frozen.

## 🚀 Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + Custom Design System |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Hosting | Vercel |
| Charts | Recharts |
| Export | SheetJS (xlsx) |

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/
│   │   ├── pos/               # POS Kasir
│   │   ├── customers/         # Database Customer
│   │   ├── inventory/         # Database Stok
│   │   ├── expenses/          # Pengeluaran
│   │   ├── receivables/       # Manajemen Piutang
│   │   ├── reports/           # Laporan & Analisis
│   │   └── settings/          # Pengaturan
│   └── api/                   # API Routes
├── components/
│   ├── shared/                # Sidebar, DataTable, dll
│   ├── dashboard/             # Dashboard widgets
│   ├── pos/                   # POS components
│   └── inventory/             # Inventory components
├── lib/
│   ├── supabase/              # Supabase clients
│   ├── utils/                 # Currency, dates, cn
│   └── hooks/                 # Custom React hooks
└── types/
    └── database.ts            # TypeScript types
supabase/
└── migrations/
    └── 001_initial_schema.sql # Full DB schema + RLS
```

## ⚙️ Setup & Development

### 1. Clone & Install
```bash
git clone <repo-url>
cd sbr-pos
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local dengan credentials Supabase Anda
```

### 3. Setup Supabase
1. Buat project baru di [supabase.com](https://supabase.com)
2. Copy URL dan anon key ke `.env.local`
3. Jalankan migration di Supabase SQL Editor:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
4. Buat user pertama (Super Admin) di Supabase Auth

### 4. Run Development Server
```bash
npm run dev
# Buka http://localhost:3000
```

## 🏗️ Database Schema

| Tabel | Deskripsi |
|---|---|
| `profiles` | User accounts + roles |
| `store_settings` | Konfigurasi toko |
| `products` | Katalog produk + stok |
| `customers` | Database pelanggan |
| `transactions` | Header transaksi penjualan |
| `transaction_items` | Detail item per transaksi |
| `expenses` | Pengeluaran operasional |
| `stock_adjustments` | Audit log perubahan stok |
| `debt_payments` | Cicilan/pelunasan piutang |

## 🔐 User Roles

| Role | Akses |
|---|---|
| `super_admin` | Full access semua menu |
| `kasir` | POS, Customer, Piutang |
| `admin_gudang` | Stok, Stock Adjustment |

## 📊 Laporan yang Tersedia

- Laporan Penjualan (harian/bulanan/custom)
- Laporan Biaya Operasional
- Laporan Nilai Aset Stok
- **Laporan Laba Rugi Otomatis** (Gross Profit - Expenses = Net Profit)

## 🚀 Deploy ke Vercel

1. Push ke GitHub
2. Connect repo di [vercel.com](https://vercel.com)
3. Tambahkan environment variables di Vercel dashboard
4. Deploy otomatis!

## 📋 Changelog

### v1.0.0 — 12 Agustus 2026
- Initial scaffold: Next.js 14 + Supabase + Tailwind
- Database schema + RLS policies (9 tabel)
- Auth: Login page + Middleware + Session management
- Dashboard layout + collapsible sidebar
- Design system: CSS variables, components, animations

---

Built with ❤️ for SBR Frozen Business
