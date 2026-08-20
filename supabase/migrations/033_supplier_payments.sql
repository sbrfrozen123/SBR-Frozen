-- Add amount_paid to purchases table
ALTER TABLE public.purchases ADD COLUMN amount_paid NUMERIC(15,2) DEFAULT 0;

-- Update existing records
UPDATE public.purchases SET amount_paid = total_amount WHERE payment_status = 'lunas';

-- Create supplier_payments table
CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    amount NUMERIC(15,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('tunai', 'transfer', 'qris', 'transfer_bank')),
    payment_account TEXT,
    notes TEXT,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    payment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

-- Policies for supplier_payments
CREATE POLICY "Users can view supplier_payments in their branch" ON public.supplier_payments
    FOR SELECT USING (
        branch_id IN (
            SELECT unnest(branch_ids) FROM public.profiles WHERE id = auth.uid()
        )
        OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );

CREATE POLICY "Users can insert supplier_payments" ON public.supplier_payments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Add triggers for updated_at
CREATE TRIGGER set_supplier_payments_updated_at
    BEFORE UPDATE ON public.supplier_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
