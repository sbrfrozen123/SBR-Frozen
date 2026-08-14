-- 1. Add branch_id to cashier_shifts
DO $$
DECLARE
  default_branch_id UUID;
BEGIN
  -- Get the default branch id
  SELECT id INTO default_branch_id FROM public.branches LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cashier_shifts' AND column_name='branch_id') THEN
    ALTER TABLE public.cashier_shifts ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    UPDATE public.cashier_shifts SET branch_id = default_branch_id WHERE branch_id IS NULL;
    ALTER TABLE public.cashier_shifts ALTER COLUMN branch_id SET NOT NULL;
  END IF;
END $$;

-- 2. Drop existing RLS policies on cashier_shifts
DROP POLICY IF EXISTS "shifts_select_admin" ON public.cashier_shifts;
DROP POLICY IF EXISTS "shifts_select_kasir_own" ON public.cashier_shifts;
DROP POLICY IF EXISTS "shifts_insert_kasir" ON public.cashier_shifts;
DROP POLICY IF EXISTS "shifts_update_kasir_own" ON public.cashier_shifts;

-- 3. Create updated RLS policies
CREATE POLICY "shifts_select_admin"
  ON public.cashier_shifts FOR SELECT
  USING (public.get_my_role() = 'super_admin');

CREATE POLICY "shifts_select_kasir_own"
  ON public.cashier_shifts FOR SELECT
  USING (public.get_my_role() = 'kasir' AND user_id = auth.uid());

-- Allow insert if user_id matches and they belong to the branch (or they are super_admin but mostly for kasir)
CREATE POLICY "shifts_insert_kasir"
  ON public.cashier_shifts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "shifts_update_kasir_own"
  ON public.cashier_shifts FOR UPDATE
  USING (user_id = auth.uid());
