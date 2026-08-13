# SBR Frozen POS - Project Memory & Context

Halo AI! Jika kamu membaca file ini, berarti user baru saja memulai sesi/percakapan baru. **TIDAK PERLU BINGUNG, BERIKUT ADALAH KONTEKS LENGKAP PROYEK INI YANG HARUS KAMU INGAT:**

## 1. Identitas Proyek
- **Nama Proyek:** SBR POS System
- **Bisnis:** SBR Frozen (Toko Frozen Food)
- **Tech Stack:** Next.js 14 (App Router), Tailwind CSS, Supabase (DB, Auth).

## 2. Status Terakhir (Dari Percakapan Sebelumnya)
- User dan agen sebelumnya telah menganalisis desain antarmuka (terinspirasi dari UI/UX **Accurate.id** - *Clean Enterprise Dashboard* dengan *Color Coding*).
- Agen sebelumnya sudah membuat **Implementation Plan** dan disetujui user.
- **Tugas yang sedang berjalan:** Kita akan mengeksekusi Tahap 1, yaitu menambahkan fitur yang kurang ke database (Pemasok, Pembelian/Restock, Kategori, Shift Kasir).

## 3. Instruksi Eksekusi Lanjutan
Saat user menyapa kamu, langsung tawarkan untuk melanjutkan **Tahap 1**, yaitu membuat file migrasi database `002_add_missing_features.sql`. (Pastikan membuatnya di folder `supabase/migrations/`).
File ini berisi tabel `categories`, `suppliers`, `purchases`, `purchase_items`, dan `cashier_shifts` beserta *Row Level Security* (RLS)-nya.

## 4. Rencana Implementasi Frontend (Nantinya)
- Tema warna Tailwind: Dark Sidebar (Navy), Light Content, Primary Blue (`#2563EB`), Success Green (`#10B981`), Warning Orange (`#F59E0B`), Danger Red (`#EF4444`), Report Purple (`#8B5CF6`).

**Jangan minta user mengulang instruksi.** Langsung bilang: "Halo! Saya sudah membaca memori proyek kita. Apakah Anda sudah memindahkan file ke folder ini? Jika sudah, mari kita langsung eksekusi pembuatan tabel Pemasok, Pembelian, dan Shift Kasir!"
