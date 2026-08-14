-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.4.0
-- Feature: Sales Canvassing & Order Approval (Sales Order)
-- ============================================================

-- 1. Add 'sales' role to profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'kasir', 'admin_gudang', 'sales'));

-- 2. Add 'order_status' to transactions
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_order_status_check;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'completed';
ALTER TABLE public.transactions ADD CONSTRAINT transactions_order_status_check
  CHECK (order_status IN ('pending', 'approved', 'processing', 'completed', 'cancelled'));

-- Update existing transactions to be completed
UPDATE public.transactions SET order_status = 'completed' WHERE order_status IS NULL;

-- 3. Update RLS Policies for Transactions to include Sales
-- Drop old policies if we need to replace them
DROP POLICY IF EXISTS "transactions_select_kasir_own" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_kasir_admin" ON public.transactions;

-- Sales can view their own transactions (orders)
CREATE POLICY "transactions_select_sales_own"
  ON public.transactions FOR SELECT
  USING (public.get_my_role() = 'sales' AND user_id = auth.uid());

-- Kasir can view their own transactions
CREATE POLICY "transactions_select_kasir_own"
  ON public.transactions FOR SELECT
  USING (public.get_my_role() = 'kasir' AND user_id = auth.uid());

-- Sales can insert new transactions (Sales Orders)
CREATE POLICY "transactions_insert_all"
  ON public.transactions FOR INSERT
  WITH CHECK (public.get_my_role() IN ('super_admin', 'kasir', 'sales') AND user_id = auth.uid());

-- Kasir can update transactions (e.g., to Approve Sales Orders and process them)
DROP POLICY IF EXISTS "transactions_update_kasir_admin" ON public.transactions;
CREATE POLICY "transactions_update_kasir_admin"
  ON public.transactions FOR UPDATE
  USING (public.get_my_role() IN ('super_admin', 'kasir'));

-- 4. Update RLS Policies for Transaction Items
DROP POLICY IF EXISTS "txn_items_select_kasir_own" ON public.transaction_items;
DROP POLICY IF EXISTS "txn_items_insert_kasir_admin" ON public.transaction_items;

CREATE POLICY "txn_items_select_kasir_sales_own"
  ON public.transaction_items FOR SELECT
  USING (
    public.get_my_role() IN ('kasir', 'sales') AND
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "txn_items_insert_kasir_sales_admin"
  ON public.transaction_items FOR INSERT
  WITH CHECK (public.get_my_role() IN ('super_admin', 'kasir', 'sales'));

-- ============================================================
-- NOTE: 
-- In the application logic, when a 'sales' creates a transaction,
-- it MUST be inserted with order_status = 'pending'.
-- Kasir transactions will be inserted with order_status = 'completed'.
-- Super Admin / Admin Gudang can update order_status.
-- ============================================================
