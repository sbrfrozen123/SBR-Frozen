-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.6.0
-- Performance Optimization: Indices
-- ============================================================

-- Create indexes on warehouse_id for faster filtering in stocks and purchases
CREATE INDEX IF NOT EXISTS idx_product_stocks_warehouse ON public.product_stocks(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_purchases_warehouse ON public.purchases(warehouse_id);

-- Create index on name for products and customers (useful for search)
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

-- Create index on product_id for stock_adjustments if not already covered
CREATE INDEX IF NOT EXISTS idx_stock_adj_product_id ON public.stock_adjustments(product_id);

-- Create index on barcode for quick POS scanning
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);

-- Ensure customer categories and product categories are indexed
CREATE INDEX IF NOT EXISTS idx_customers_category ON public.customers(category);
