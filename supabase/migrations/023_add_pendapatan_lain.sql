-- Menambahkan tipe 'pendapatan_lain' ke tabel cash_transactions

ALTER TABLE public.cash_transactions 
  DROP CONSTRAINT IF EXISTS cash_transactions_type_check;

ALTER TABLE public.cash_transactions 
  ADD CONSTRAINT cash_transactions_type_check 
  CHECK (type IN ('saldo_awal', 'setor_kas', 'tarik_kas', 'mutasi_ke_bank', 'mutasi_ke_kas', 'pendapatan_lain'));
