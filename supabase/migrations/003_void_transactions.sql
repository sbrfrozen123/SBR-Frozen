-- ============================================================
-- MIGRATION: 003_void_transactions
-- Menambahkan fitur Void (Pembatalan Transaksi)
-- ============================================================

-- 1. Tambahkan kolom status ke tabel transactions (jika belum ada)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'
CHECK (status IN ('completed', 'voided'));

-- 2. Buat fungsi RPC untuk melakukan Void transaksi secara aman (Atomic)
CREATE OR REPLACE FUNCTION public.void_transaction(txn_id UUID, void_reason TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
  v_user_id UUID;
  item RECORD;
BEGIN
  -- Dapatkan user ID yang sedang mengeksekusi
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Pastikan hanya super_admin yang boleh melakukan void (opsional/keamanan tambahan)
  -- IF public.get_my_role() != 'super_admin' THEN
  --   RAISE EXCEPTION 'Unauthorized: Only super_admin can void transactions';
  -- END IF;

  -- Cek status transaksi saat ini
  SELECT status INTO v_status FROM public.transactions WHERE id = txn_id;
  
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  IF v_status = 'voided' THEN
    RAISE EXCEPTION 'Transaction is already voided';
  END IF;

  -- 1. Ubah status transaksi menjadi voided
  UPDATE public.transactions SET status = 'voided' WHERE id = txn_id;

  -- 2. Kembalikan stok untuk setiap item di transaksi
  FOR item IN SELECT product_id, qty FROM public.transaction_items WHERE transaction_id = txn_id LOOP
    
    -- a. Update qty di tabel products
    UPDATE public.products 
    SET stock_quantity = stock_quantity + item.qty 
    WHERE id = item.product_id;

    -- b. Catat di stock_adjustments sebagai riwayat pengembalian
    INSERT INTO public.stock_adjustments (
      product_id, 
      user_id, 
      type, 
      qty_before, 
      qty_change, 
      qty_after, 
      reason, 
      reference_id
    )
    SELECT 
      item.product_id,
      v_user_id,
      'tambah',
      p.stock_quantity - item.qty, -- Qty before (karena sudah ditambah di atas)
      item.qty,
      p.stock_quantity,           -- Qty after
      COALESCE(void_reason, 'Void Transaksi'),
      txn_id
    FROM public.products p
    WHERE p.id = item.product_id;

  END LOOP;
END;
$$;
