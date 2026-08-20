-- Migration 032: Add auto-generated codes for entities

-- 1. Add Code Columns
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;

-- 2. Create Sequences for auto-incrementing numbers
CREATE SEQUENCE IF NOT EXISTS seq_customers_code START 1;
CREATE SEQUENCE IF NOT EXISTS seq_suppliers_code START 1;
CREATE SEQUENCE IF NOT EXISTS seq_warehouses_code START 1;
CREATE SEQUENCE IF NOT EXISTS seq_categories_code START 1;
CREATE SEQUENCE IF NOT EXISTS seq_products_sku START 1;

-- 3. Create Trigger Functions to generate codes BEFORE INSERT
-- Customers (CUST-0001)
CREATE OR REPLACE FUNCTION generate_customer_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := 'CUST-' || LPAD(nextval('seq_customers_code')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customers_code ON public.customers;
CREATE TRIGGER trg_customers_code
BEFORE INSERT ON public.customers
FOR EACH ROW
EXECUTE FUNCTION generate_customer_code();

-- Suppliers (SUP-0001)
CREATE OR REPLACE FUNCTION generate_supplier_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := 'SUP-' || LPAD(nextval('seq_suppliers_code')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_suppliers_code ON public.suppliers;
CREATE TRIGGER trg_suppliers_code
BEFORE INSERT ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION generate_supplier_code();

-- Warehouses (WH-001)
CREATE OR REPLACE FUNCTION generate_warehouse_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := 'WH-' || LPAD(nextval('seq_warehouses_code')::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_warehouses_code ON public.warehouses;
CREATE TRIGGER trg_warehouses_code
BEFORE INSERT ON public.warehouses
FOR EACH ROW
EXECUTE FUNCTION generate_warehouse_code();

-- Categories (CAT-001)
CREATE OR REPLACE FUNCTION generate_category_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := 'CAT-' || LPAD(nextval('seq_categories_code')::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_categories_code ON public.categories;
CREATE TRIGGER trg_categories_code
BEFORE INSERT ON public.categories
FOR EACH ROW
EXECUTE FUNCTION generate_category_code();

-- Products (PRD-0001) for `sku` column
CREATE OR REPLACE FUNCTION generate_product_sku()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sku IS NULL OR NEW.sku = '' THEN
        NEW.sku := 'PRD-' || LPAD(nextval('seq_products_sku')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_sku ON public.products;
CREATE TRIGGER trg_products_sku
BEFORE INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION generate_product_sku();

-- 4. Backfill existing records with generated codes
UPDATE public.customers SET code = 'CUST-' || LPAD(nextval('seq_customers_code')::text, 4, '0') WHERE code IS NULL;
UPDATE public.suppliers SET code = 'SUP-' || LPAD(nextval('seq_suppliers_code')::text, 4, '0') WHERE code IS NULL;
UPDATE public.warehouses SET code = 'WH-' || LPAD(nextval('seq_warehouses_code')::text, 3, '0') WHERE code IS NULL;
UPDATE public.categories SET code = 'CAT-' || LPAD(nextval('seq_categories_code')::text, 3, '0') WHERE code IS NULL;

-- Note: We don't backfill Products because their sku shouldn't be null, but just in case:
UPDATE public.products SET sku = 'PRD-' || LPAD(nextval('seq_products_sku')::text, 4, '0') WHERE sku IS NULL OR sku = '';
