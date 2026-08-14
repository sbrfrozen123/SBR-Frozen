
-- ========================================================
-- SCRIPT IMPORT STOK AWAL BARANG (SBR FROZEN)
-- ========================================================

DO $$
DECLARE
    v_branch_id UUID;
    v_product_id UUID;
BEGIN
    -- 1. Ambil atau buat branch (Cabang Utama)
    SELECT id INTO v_branch_id FROM public.branches LIMIT 1;
    
    IF v_branch_id IS NULL THEN
        INSERT INTO public.branches (name, address, phone, is_active)
        VALUES ('Cabang Utama', 'Pekanbaru', '08123456789', true)
        RETURNING id INTO v_branch_id;
    END IF;

    -- 2. Ambil atau buat Kategori Umum
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Umum') THEN
        INSERT INTO public.categories (name, description)
        VALUES ('Umum', 'Kategori default untuk barang import');
    END IF;

    -- 3. Insert Data Barang & Stok

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'EKOR', 'Satuan EKOR'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'EKOR');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM 0.6 UTUH' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM 0.6 UTUH', 'SKU-1C3WGM', 'EKOR', 0, 0, 'Umum', 423)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 423 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 423
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 423);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'EKOR', 'Satuan EKOR'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'EKOR');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM 0.7 UTUH' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM 0.7 UTUH', 'SKU-B2T0LC', 'EKOR', 0, 0, 'Umum', 3)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 3 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 3
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 3);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'EKOR', 'Satuan EKOR'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'EKOR');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM 0.8 UTUH' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM 0.8 UTUH', 'SKU-97571Q', 'EKOR', 0, 0, 'Umum', 182)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 182 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 182
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 182);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'EKOR', 'Satuan EKOR'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'EKOR');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM 0.9 UTUH' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM 0.9 UTUH', 'SKU-OVL3GA', 'EKOR', 0, 0, 'Umum', 837)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 837 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 837
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 837);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM 1.1 UTUH' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM 1.1 UTUH', 'SKU-B0NX5Y', 'PCS', 0, 0, 'Umum', 46)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 46 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 46
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 46);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM 1.4 UTUH' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM 1.4 UTUH', 'SKU-2GA4MP', 'PCS', 0, 0, 'Umum', 200)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 200 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 200
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 200);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM AMPELA BERSIH 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM AMPELA BERSIH 1KG', 'SKU-X34FN0', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM BLD 500GR (DADA)' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM BLD 500GR (DADA)', 'SKU-ZNZ0MI', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM BLD 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM BLD 1KG', 'SKU-E44ATL', 'KG', 0, 0, 'Umum', 1623.5047)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 1623.5047 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 1623.5047
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 1623.5047);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM BLD 2KG TIMBANG (DADA)' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM BLD 2KG TIMBANG (DADA)', 'SKU-RJVVQK', 'KG', 0, 0, 'Umum', 4367.75)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4367.75 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4367.75
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4367.75);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM BLP 1KG TIMBANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM BLP 1KG TIMBANG', 'SKU-F0C1ZD', 'KG', 0, 0, 'Umum', 722.066)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 722.066 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 722.066
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 722.066);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM BLP 2KG TIMBANG (PAHA)' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM BLP 2KG TIMBANG (PAHA)', 'SKU-9OY9NP', 'KG', 0, 0, 'Umum', 762.497)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 762.497 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 762.497
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 762.497);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM BLP 500GR (PAHA)' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM BLP 500GR (PAHA)', 'SKU-Y38S9P', 'PCS', 0, 0, 'Umum', 12)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 12 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 12
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 12);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM BLPK 2KG TIMBANG (PAHA KULIT)' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM BLPK 2KG TIMBANG (PAHA KULIT)', 'SKU-LM1B44', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM CEKER TANPA TULANG 1 KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM CEKER TANPA TULANG 1 KG', 'SKU-CXTAQJ', 'PCS', 0, 0, 'Umum', 15)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 15 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 15
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 15);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM CEKER TANPA TULANG 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM CEKER TANPA TULANG 500GR', 'SKU-J4TKBW', 'PCS', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM CEKER TULANG 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM CEKER TULANG 1KG', 'SKU-NUPHP2', 'PACK', 0, 0, 'Umum', 19)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 19 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 19
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 19);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM DADA UTUH 500G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM DADA UTUH 500G', 'SKU-ZG1CZR', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM GILING 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM GILING 500GR', 'SKU-56OB5N', 'PCS', 0, 0, 'Umum', 7)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 7 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 7
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 7);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM HATI AMPELA KOTOR 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM HATI AMPELA KOTOR 1KG', 'SKU-406FWJ', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM HATI BERSIH 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM HATI BERSIH 1KG', 'SKU-NI6C7C', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM KAMPUNG 0.9' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM KAMPUNG 0.9', 'SKU-WDJK6I', 'PCS', 0, 0, 'Umum', 3)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 3 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 3
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 3);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM KAMPUNG 1.0 KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM KAMPUNG 1.0 KG', 'SKU-7ZOSM8', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM KULIT AYAM 500 GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM KULIT AYAM 500 GR', 'SKU-1K1HHF', 'PACK', 0, 0, 'Umum', 7)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 7 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 7
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 7);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM KULIT AYAM TIMBANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM KULIT AYAM TIMBANG', 'SKU-K7CY5D', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM PAHA ATAS 500 GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM PAHA ATAS 500 GR', 'SKU-HDLFG6', 'PACK', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM PAHA BAWAH 500 GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM PAHA BAWAH 500 GR', 'SKU-JJF4PI', 'PACK', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM PAHA BAWAH KEMASAN 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM PAHA BAWAH KEMASAN 1KG', 'SKU-D28LWB', 'PCS', 0, 0, 'Umum', 35)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 35 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 35
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 35);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM PAHA BAWAH TIMBANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM PAHA BAWAH TIMBANG', 'SKU-VWGNDQ', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM PAHA UTUH 500 GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM PAHA UTUH 500 GR', 'SKU-3RXGMC', 'PACK', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM POT 10 MY CHICKEN' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM POT 10 MY CHICKEN', 'SKU-XAN5I8', 'PCS', 0, 0, 'Umum', 671)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 671 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 671
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 671);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM SAYAP 500 GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM SAYAP 500 GR', 'SKU-NUSZTC', 'PACK', 0, 0, 'Umum', 77)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 77 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 77
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 77);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM SAYAP KEMASAN 2KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM SAYAP KEMASAN 2KG', 'SKU-LFYOKN', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM SLICE DADA 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM SLICE DADA 500GR', 'SKU-ZR3YYU', 'PACK', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM UTUH CUT 4 UK 0.8' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM UTUH CUT 4 UK 0.8', 'SKU-2P7LZL', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'EKOR', 'Satuan EKOR'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'EKOR');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM UTUH POTONG 10' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM UTUH POTONG 10', 'SKU-CGYGLF', 'EKOR', 0, 0, 'Umum', 6538)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 6538 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 6538
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 6538);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM UTUH POTONG 12' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM UTUH POTONG 12', 'SKU-U14BTS', 'PCS', 0, 0, 'Umum', 96)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 96 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 96
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 96);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'AYAM UTUH POTONG 16' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('AYAM UTUH POTONG 16', 'SKU-SYK8ZS', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BABY CUMI ASIN 250GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BABY CUMI ASIN 250GR', 'SKU-DLWRER', 'PCS', 0, 0, 'Umum', 7)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 7 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 7
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 7);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BABY CUMI SEGAR 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BABY CUMI SEGAR 500GR', 'SKU-IIQ5LX', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAKPAU KARAKTER COKLAT' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAKPAU KARAKTER COKLAT', 'SKU-1MZT0K', 'PACK', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAKSO MAJU MAPAN 725GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAKSO MAJU MAPAN 725GR', 'SKU-9JYLC4', 'PCS', 0, 0, 'Umum', 14)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 14 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 14
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 14);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAKSO A3 MAKNYUS POLOS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAKSO A3 MAKNYUS POLOS', 'SKU-MJTEU5', 'PCS', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAKSO MAKNYUS URAT' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAKSO MAKNYUS URAT', 'SKU-O21FZ0', 'PCS', 0, 0, 'Umum', 39)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 39 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 39
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 39);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAKSO TENIS MAKNYUS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAKSO TENIS MAKNYUS', 'SKU-ORELQM', 'PCS', 0, 0, 'Umum', 15)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 15 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 15
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 15);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE BALADO' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE BALADO', 'SKU-FDKTVG', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE BALI' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE BALI', 'SKU-VCVPPX', 'PCS', 0, 0, 'Umum', 18)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 18 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 18
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 18);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE BULGOGI' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE BULGOGI', 'SKU-H3CAMB', 'PCS', 0, 0, 'Umum', 10)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 10 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 10
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 10);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE GULE' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE GULE', 'SKU-OBF9UA', 'PCS', 0, 0, 'Umum', 23)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 23 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 23
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 23);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'EKOR', 'Satuan EKOR'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'EKOR');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE KUAH BAKSO' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE KUAH BAKSO', 'SKU-W963CN', 'EKOR', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE MIE GORENG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE MIE GORENG', 'SKU-741UZ2', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE NASGOR PEDAS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE NASGOR PEDAS', 'SKU-QRBR7C', 'PCS', 0, 0, 'Umum', 20)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 20 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 20
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 20);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE OPOR AYAM' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE OPOR AYAM', 'SKU-RJHUK4', 'PCS', 0, 0, 'Umum', 15)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 15 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 15
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 15);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE RAWON' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE RAWON', 'SKU-Y4AYK4', 'PCS', 0, 0, 'Umum', 19)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 19 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 19
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 19);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE RENDANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE RENDANG', 'SKU-DK2AH9', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE RICA-RICA' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE RICA-RICA', 'SKU-CPL4MH', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE SEMUR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE SEMUR', 'SKU-00QZ52', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE SOP' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE SOP', 'SKU-778OF7', 'PCS', 0, 0, 'Umum', 17)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 17 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 17
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 17);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE SOTO AYAM' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE SOTO AYAM', 'SKU-NXLJCB', 'PCS', 0, 0, 'Umum', 24)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 24 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 24
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 24);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BAMBOE TOM YUM' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BAMBOE TOM YUM', 'SKU-AHISLL', 'PCS', 0, 0, 'Umum', 3)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 3 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 3
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 3);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BASO ACI TETEH SAMYANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BASO ACI TETEH SAMYANG', 'SKU-RNP9H1', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BASO ACI TETEH T. RANGU' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BASO ACI TETEH T. RANGU', 'SKU-3SDZOG', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BEBEK 1,0' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BEBEK 1,0', 'SKU-GFVW3Y', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BEBEK 1.1' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BEBEK 1.1', 'SKU-WA0NV4', 'PCS', 0, 0, 'Umum', 538)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 538 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 538
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 538);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BEBEK 1.2' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BEBEK 1.2', 'SKU-SYYF2D', 'PCS', 0, 0, 'Umum', 118)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 118 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 118
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 118);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BEBEK 1.3' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BEBEK 1.3', 'SKU-7CT5UN', 'PCS', 0, 0, 'Umum', 45)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 45 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 45
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 45);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BEBEK 1.4' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BEBEK 1.4', 'SKU-XDR192', 'PCS', 0, 0, 'Umum', 195)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 195 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 195
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 195);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BEBEK 1.5' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BEBEK 1.5', 'SKU-MF1HBV', 'PCS', 0, 0, 'Umum', 73)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 73 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 73
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 73);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BEBEK 1.6' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BEBEK 1.6', 'SKU-NFMBWR', 'PCS', 0, 0, 'Umum', 27)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 27 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 27
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 27);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'BROKOLI 1 KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('BROKOLI 1 KG', 'SKU-U4CCLO', 'PCS', 0, 0, 'Umum', 14)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 14 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 14
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 14);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA CHIKUWA 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA CHIKUWA 1KG', 'SKU-FOYR1S', 'PACK', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA CHIKUWA 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA CHIKUWA 500GR', 'SKU-7VFP0M', 'PCS', 0, 0, 'Umum', 14)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 14 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 14
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 14);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA CRAB STICK 250GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA CRAB STICK 250GR', 'SKU-BOO8IO', 'PCS', 0, 0, 'Umum', 37)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 37 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 37
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 37);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA CRAB STIK 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA CRAB STIK 1KG', 'SKU-UVKBJZ', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA DUMP CHEESE 500 GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA DUMP CHEESE 500 GR', 'SKU-H8ISMG', 'PCS', 0, 0, 'Umum', 21)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 21 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 21
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 21);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA DUMP CHICK 500 GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA DUMP CHICK 500 GR', 'SKU-KIKYUF', 'PCS', 0, 0, 'Umum', 24)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 24 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 24
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 24);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA DUMP SPICY 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA DUMP SPICY 500GR', 'SKU-YDY2KE', 'PCS', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA DUO TWISTER 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA DUO TWISTER 500GR', 'SKU-4O9OM7', 'PCS', 0, 0, 'Umum', 19)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 19 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 19
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 19);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA FLOWER TWISTER 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA FLOWER TWISTER 500GR', 'SKU-9CR55S', 'PCS', 0, 0, 'Umum', 22)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 22 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 22
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 22);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA KARTUN 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA KARTUN 500GR', 'SKU-MCZPH6', 'PCS', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA MAGIC BOMB 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA MAGIC BOMB 500GR', 'SKU-6NACRH', 'PCS', 0, 0, 'Umum', 17)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 17 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 17
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 17);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA ODENG ORI 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA ODENG ORI 500GR', 'SKU-CH7HEG', 'PCS', 0, 0, 'Umum', 17)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 17 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 17
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 17);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA OTAK-OTAK 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA OTAK-OTAK 500GR', 'SKU-S3BK0I', 'PCS', 0, 0, 'Umum', 21)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 21 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 21
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 21);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CEDEA STEAMBOAT TOMYUM' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CEDEA STEAMBOAT TOMYUM', 'SKU-90J6CP', 'PCS', 0, 0, 'Umum', 10)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 10 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 10
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 10);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CENDOL CEBONG ARORA' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CENDOL CEBONG ARORA', 'SKU-SAK1IJ', 'PCS', 0, 0, 'Umum', 14)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 14 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 14
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 14);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CHAMP BAKSO AYAM 500 GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CHAMP BAKSO AYAM 500 GR', 'SKU-3N87XL', 'PCS', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CHAMP BURGER 315GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CHAMP BURGER 315GR', 'SKU-HJD40M', 'PCS', 0, 0, 'Umum', 16)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 16 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 16
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 16);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CHAMP NUGGET 123' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CHAMP NUGGET 123', 'SKU-8WH1IJ', 'PCS', 0, 0, 'Umum', 1)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 1 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 1
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 1);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CHAMP NUGGET AYAM 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CHAMP NUGGET AYAM 500GR', 'SKU-B70UBJ', 'PCS', 0, 0, 'Umum', 13)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 13 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 13
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 13);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CHAMP SIOMAY 180GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CHAMP SIOMAY 180GR', 'SKU-4CYH47', 'PCS', 0, 0, 'Umum', 14)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 14 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 14
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 14);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CHAMP SOSIS AYAM 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CHAMP SOSIS AYAM 1KG', 'SKU-LQS7Z4', 'PCS', 0, 0, 'Umum', 6)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 6 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 6
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 6);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CHAMP SOSIS AYAM 375GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CHAMP SOSIS AYAM 375GR', 'SKU-AJVM1F', 'PCS', 0, 0, 'Umum', 16)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 16 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 16
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 16);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CHAMP SOSIS AYAM 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CHAMP SOSIS AYAM 500GR', 'SKU-18HLEE', 'PCS', 0, 0, 'Umum', 12)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 12 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 12
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 12);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CHAMP SOSIS SAPI 375GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CHAMP SOSIS SAPI 375GR', 'SKU-J3UFZV', 'PCS', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CIRENG SALJU ORI' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CIRENG SALJU ORI', 'SKU-BQIQKY', 'PCS', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CIRENG SALJU PEDAS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CIRENG SALJU PEDAS', 'SKU-G234QI', 'PCS', 0, 0, 'Umum', 13)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 13 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 13
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 13);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'CUMI TUBE 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('CUMI TUBE 1KG', 'SKU-MOACHO', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING ANGLO BEEF' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING ANGLO BEEF', 'SKU-F4XEA3', 'KG', 0, 0, 'Umum', 117.37)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 117.37 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 117.37
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 117.37);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING BLADE SLICE 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING BLADE SLICE 500GR', 'SKU-ONK21O', 'PCS', 0, 0, 'Umum', 6)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 6 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 6
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 6);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING BRAVO CUT MEAT 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING BRAVO CUT MEAT 1KG', 'SKU-WA4KQN', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING BRAVO RAWON' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING BRAVO RAWON', 'SKU-87T6VS', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING BRAVO RENDANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING BRAVO RENDANG', 'SKU-49XMYM', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING BRAVO TULANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING BRAVO TULANG', 'SKU-JCYN3S', 'PCS', 0, 0, 'Umum', 10)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 10 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 10
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 10);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING ECO/VALUE MIX FAT BELLY' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING ECO/VALUE MIX FAT BELLY', 'SKU-MTM20L', 'PCS', 0, 0, 'Umum', 51)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 51 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 51
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 51);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING GILING 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING GILING 500GR', 'SKU-A97XKS', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING GILING PREMIUM 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING GILING PREMIUM 1KG', 'SKU-5CRNC1', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING GILING STANDAR 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING GILING STANDAR 1KG', 'SKU-N9IZE9', 'PCS', 0, 0, 'Umum', 45)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 45 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 45
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 45);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING IGA BORELLO/ECT DUS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING IGA BORELLO/ECT DUS', 'SKU-GRHHBM', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING IGA GONDRONG 1 KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING IGA GONDRONG 1 KG', 'SKU-L31AYL', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING IGA RUSUK TIMBANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING IGA RUSUK TIMBANG', 'SKU-6SIKS3', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING KAMBING UTUH EKOR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING KAMBING UTUH EKOR', 'SKU-1CYCOX', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING LONTONG 105/106 PER DUS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING LONTONG 105/106 PER DUS', 'SKU-0543PW', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING NIKUMURA BEEF SLICE' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING NIKUMURA BEEF SLICE', 'SKU-URVMZD', 'PACK', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING PARU SAPI DUS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING PARU SAPI DUS', 'SKU-3MGYNX', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING PARU SAPI TIMBANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING PARU SAPI TIMBANG', 'SKU-8SMBLZ', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING RAWON TIMBANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING RAWON TIMBANG', 'SKU-8RK8A9', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING RENDANG KODE 41' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING RENDANG KODE 41', 'SKU-RS12BQ', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING RENDANG KODE 42 PER DUS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING RENDANG KODE 42 PER DUS', 'SKU-JE2PHH', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING RENDANG PREMIUM' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING RENDANG PREMIUM', 'SKU-SRU67Q', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING SAFA/KAMIL CM-001' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING SAFA/KAMIL CM-001', 'SKU-AAANVR', 'PCS', 0, 0, 'Umum', 85)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 85 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 85
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 85);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING SAPI PER DUS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING SAPI PER DUS', 'SKU-QR246D', 'KG', 0, 0, 'Umum', 299.01)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 299.01 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 299.01
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 299.01);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING SLICE PREMIUM BELLY 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING SLICE PREMIUM BELLY 500GR', 'SKU-BQ88PN', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING TETELAN 40 CL PER DUS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING TETELAN 40 CL PER DUS', 'SKU-N2MVF5', 'KG', 0, 0, 'Umum', 0.01)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0.01 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0.01
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0.01);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING TULANG RANGU 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING TULANG RANGU 1KG', 'SKU-ZG37WK', 'PCS', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DAGING WM202/FQ11/CM-01' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DAGING WM202/FQ11/CM-01', 'SKU-AYDJVZ', 'PCS', 0, 0, 'Umum', 21)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 21 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 21
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 21);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DELMONTE BBQ 250G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DELMONTE BBQ 250G', 'SKU-NY0H1T', 'PCS', 0, 0, 'Umum', 1)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 1 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 1
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 1);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DELMONTE KOREAN BBQ 250G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DELMONTE KOREAN BBQ 250G', 'SKU-R8318V', 'PCS', 0, 0, 'Umum', 1)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 1 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 1
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 1);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DELMONTE PEDAS 200G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DELMONTE PEDAS 200G', 'SKU-HCHOND', 'PCS', 0, 0, 'Umum', 6)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 6 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 6
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 6);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DELMONTE SAOS PEDAS 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DELMONTE SAOS PEDAS 1KG', 'SKU-L33FJ9', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DELMONTE SAUS BBQ 1 KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DELMONTE SAUS BBQ 1 KG', 'SKU-ZD4T0W', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DELMONTE SAUS LADA HITAM 250G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DELMONTE SAUS LADA HITAM 250G', 'SKU-LJNSED', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DELMONTE SAUS TOMAT 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DELMONTE SAUS TOMAT 1KG', 'SKU-JLKXCL', 'PCS', 0, 0, 'Umum', 17)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 17 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 17
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 17);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DELMONTE SPAGETI SAUS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DELMONTE SPAGETI SAUS', 'SKU-OB43XE', 'PCS', 0, 0, 'Umum', 15)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 15 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 15
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 15);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DELMONTE TASTY CHILI 200GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DELMONTE TASTY CHILI 200GR', 'SKU-9476MA', 'PCS', 0, 0, 'Umum', 24)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 24 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 24
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 24);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DELMONTE TOMAT 200G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DELMONTE TOMAT 200G', 'SKU-X67J7R', 'PCS', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DIMSUM AKAI' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DIMSUM AKAI', 'SKU-XSMNGA', 'PCS', 0, 0, 'Umum', 41)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 41 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 41
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 41);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DONAT PANDAN 450GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DONAT PANDAN 450GR', 'SKU-F6ZBTX', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'DOSUKA SPICY WINGS 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('DOSUKA SPICY WINGS 500GR', 'SKU-H4G5NR', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'EDAMAME ORI 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('EDAMAME ORI 500GR', 'SKU-3FI1QH', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ELAFROZE FISHROLL 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ELAFROZE FISHROLL 500GR', 'SKU-9MDOCC', 'PCS', 0, 0, 'Umum', 8)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 8 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 8
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 8);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'FIESTA KARAGE 500G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('FIESTA KARAGE 500G', 'SKU-OPBZR4', 'PCS', 0, 0, 'Umum', 19)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 19 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 19
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 19);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'FIESTA NUGGET 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('FIESTA NUGGET 500GR', 'SKU-2GY5TB', 'PCS', 0, 0, 'Umum', 15)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 15 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 15
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 15);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'FIESTA NUGGET DINO 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('FIESTA NUGGET DINO 500GR', 'SKU-6DO5FJ', 'PACK', 0, 0, 'Umum', 8)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 8 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 8
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 8);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'FIESTA NUGGET KARAKTER ABC' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('FIESTA NUGGET KARAKTER ABC', 'SKU-S7FGVF', 'PCS', 0, 0, 'Umum', 13)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 13 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 13
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 13);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'FIESTA RTG SOSIS CHEESY LAVA' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('FIESTA RTG SOSIS CHEESY LAVA', 'SKU-3UF1BT', 'PCS', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'FIESTA RTG SOSIS CHEESY MELT' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('FIESTA RTG SOSIS CHEESY MELT', 'SKU-YDJLL1', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'FIESTA RTG SOSIS HOT LAVA' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('FIESTA RTG SOSIS HOT LAVA', 'SKU-FZCK4L', 'PCS', 0, 0, 'Umum', 10)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 10 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 10
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 10);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'FIESTA RTG SOSIS KOREAN' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('FIESTA RTG SOSIS KOREAN', 'SKU-462M31', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'FIESTA SHOESTRING 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('FIESTA SHOESTRING 500GR', 'SKU-FC6MCD', 'PCS', 0, 0, 'Umum', 10)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 10 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 10
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 10);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'FIESTA SPICY WING 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('FIESTA SPICY WING 500GR', 'SKU-9R2HLY', 'PCS', 0, 0, 'Umum', 13)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 13 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 13
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 13);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'GAS PORTABEL' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('GAS PORTABEL', 'SKU-HNUHI3', 'PCS', 0, 0, 'Umum', 19)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 19 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 19
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 19);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'GOURMET BBQ' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('GOURMET BBQ', 'SKU-DSQDYJ', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'GOURMET SAUS KEJU' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('GOURMET SAUS KEJU', 'SKU-S2W881', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'GULA 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('GULA 1KG', 'SKU-GEZRFN', 'PCS', 0, 0, 'Umum', 30)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 30 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 30
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 30);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'GULA 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('GULA 500GR', 'SKU-12VJRN', 'PCS', 0, 0, 'Umum', 39)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 39 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 39
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 39);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'HEMATO NUGGET LOVE 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('HEMATO NUGGET LOVE 1KG', 'SKU-JT0JFM', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'HEMATO NUGGET LOVE 500' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('HEMATO NUGGET LOVE 500', 'SKU-I9UAZS', 'PCS', 0, 0, 'Umum', 29)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 29 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 29
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 29);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'HEMATO NUGGET STICK 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('HEMATO NUGGET STICK 1KG', 'SKU-O8FO6T', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'HEMATO NUGGET STIK 500' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('HEMATO NUGGET STIK 500', 'SKU-81CF5R', 'PCS', 0, 0, 'Umum', 8)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 8 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 8
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 8);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'HEMATO SOSIS AYAM 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('HEMATO SOSIS AYAM 1KG', 'SKU-1TLGEI', 'PCS', 0, 0, 'Umum', 8)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 8 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 8
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 8);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'HEMATO SOSIS AYAM 500' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('HEMATO SOSIS AYAM 500', 'SKU-N3496L', 'PCS', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'HEMATO SOSIS SAPI 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('HEMATO SOSIS SAPI 1KG', 'SKU-88995T', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'HEMATO SOSIS SAPI 500' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('HEMATO SOSIS SAPI 500', 'SKU-N76Z9S', 'PCS', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'IKAN DORI FILLET' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('IKAN DORI FILLET', 'SKU-9ZJ03O', 'PCS', 0, 0, 'Umum', 658)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 658 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 658
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 658);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'IKAN NILA' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('IKAN NILA', 'SKU-M9YGXX', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'IKAN PATIN' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('IKAN PATIN', 'SKU-COA099', 'KG', 0, 0, 'Umum', 10)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 10 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 10
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 10);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'IKAN TENGGIRI GILING 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('IKAN TENGGIRI GILING 500GR', 'SKU-K959A2', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ILM AYAM-AYAMAN' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ILM AYAM-AYAMAN', 'SKU-B9J0HQ', 'PCS', 0, 0, 'Umum', 29)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 29 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 29
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 29);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ILM BINTANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ILM BINTANG', 'SKU-Y3CRAQ', 'PCS', 0, 0, 'Umum', 15)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 15 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 15
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 15);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ILM ES KRIM' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ILM ES KRIM', 'SKU-AU3I04', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'INDOMINA BAKSO MIX 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('INDOMINA BAKSO MIX 500GR', 'SKU-3KBY46', 'PCS', 0, 0, 'Umum', 28)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 28 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 28
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 28);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'INDOMINA OTAK-OTAK 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('INDOMINA OTAK-OTAK 500GR', 'SKU-3GRM1A', 'PCS', 0, 0, 'Umum', 24)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 24 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 24
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 24);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'INDOMINA SCALLOP 500G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('INDOMINA SCALLOP 500G', 'SKU-TUSFM8', 'PCS', 0, 0, 'Umum', 12)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 12 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 12
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 12);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'IP KENTANG 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('IP KENTANG 500GR', 'SKU-IUCRTS', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'IP KULIT LUMPIA BESAR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('IP KULIT LUMPIA BESAR', 'SKU-M3J90K', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'IP KULIT LUMPIA KECIL' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('IP KULIT LUMPIA KECIL', 'SKU-2P2TIE', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JAGUNG PIPIL MANIS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JAGUNG PIPIL MANIS', 'SKU-BMWA32', 'PCS', 0, 0, 'Umum', 173)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 173 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 173
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 173);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JAMUR ENOKI' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JAMUR ENOKI', 'SKU-6Q7RJF', 'PCS', 0, 0, 'Umum', 92)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 92 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 92
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 92);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD CHOCO CORN 80ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD CHOCO CORN 80ML', 'SKU-4AUW1D', 'PCS', 0, 0, 'Umum', 30)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 30 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 30
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 30);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD CHOCOBERRY 40ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD CHOCOBERRY 40ML', 'SKU-SADQE2', 'PCS', 0, 0, 'Umum', 50)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 50 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 50
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 50);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD CRUNCHY CHOCO BLUEBERRY 70 ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD CRUNCHY CHOCO BLUEBERRY 70 ML', 'SKU-CXUCUF', 'PCS', 0, 0, 'Umum', 35)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 35 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 35
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 35);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD CRUNCHY CHOCO LAVA 65 ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD CRUNCHY CHOCO LAVA 65 ML', 'SKU-CPUSME', 'PCS', 0, 0, 'Umum', 20)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 20 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 20
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 20);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD CRUNCHY CHOCO MALT 70ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD CRUNCHY CHOCO MALT 70ML', 'SKU-Z7LOOQ', 'PCS', 0, 0, 'Umum', 34)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 34 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 34
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 34);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD CRUNCHY DOB CHOCO 70ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD CRUNCHY DOB CHOCO 70ML', 'SKU-P35VLD', 'PCS', 0, 0, 'Umum', 20)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 20 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 20
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 20);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD CRUNCHY SWEET STO 70ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD CRUNCHY SWEET STO 70ML', 'SKU-R0RI81', 'PCS', 0, 0, 'Umum', 20)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 20 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 20
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 20);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD FRUIT GALAXY 45ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD FRUIT GALAXY 45ML', 'SKU-L7IOFO', 'PCS', 0, 0, 'Umum', 50)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 50 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 50
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 50);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD FRUITY DUO 42ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD FRUITY DUO 42ML', 'SKU-9MPFLS', 'PCS', 0, 0, 'Umum', 49)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 49 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 49
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 49);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD KOKOMI 35 ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD KOKOMI 35 ML', 'SKU-CO3ZF0', 'PCS', 0, 0, 'Umum', 59)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 59 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 59
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 59);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD LALAVA 35ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD LALAVA 35ML', 'SKU-ZXOW79', 'PCS', 0, 0, 'Umum', 40)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 40 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 40
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 40);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD NEAPOLITAN 160 ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD NEAPOLITAN 160 ML', 'SKU-679K26', 'PCS', 0, 0, 'Umum', 15)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 15 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 15
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 15);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD SANDWICH VANBERRY 100ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD SANDWICH VANBERRY 100ML', 'SKU-BQZV7E', 'PCS', 0, 0, 'Umum', 22)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 22 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 22
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 22);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JD WATERMELON APEL45ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JD WATERMELON APEL45ML', 'SKU-4LE7FP', 'PCS', 0, 0, 'Umum', 50)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 50 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 50
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 50);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'JEROAN HATI SAPI 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('JEROAN HATI SAPI 500GR', 'SKU-U7SG0C', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KACANG POLONG 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KACANG POLONG 1KG', 'SKU-54ZAMG', 'PCS', 0, 0, 'Umum', 28)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 28 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 28
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 28);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KAMBING POTONG GULE' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KAMBING POTONG GULE', 'SKU-UU0M6B', 'PACK', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KAMIL BAKSO SAPI 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KAMIL BAKSO SAPI 500GR', 'SKU-B4UTOI', 'PCS', 0, 0, 'Umum', 21)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 21 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 21
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 21);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KAMIL BAKSO SAPI 750GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KAMIL BAKSO SAPI 750GR', 'SKU-KRZEYD', 'PCS', 0, 0, 'Umum', 6)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 6 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 6
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 6);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KAMIL BEEF BURGER' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KAMIL BEEF BURGER', 'SKU-9VA991', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KAMIL SOSIS JUMBO 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KAMIL SOSIS JUMBO 1KG', 'SKU-Y6UX0E', 'PCS', 0, 0, 'Umum', 10)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 10 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 10
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 10);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KAMIL SOSIS JUMBO 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KAMIL SOSIS JUMBO 500GR', 'SKU-V2JKHM', 'PCS', 0, 0, 'Umum', 25)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 25 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 25
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 25);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KAMIL SOSIS MINI ISI 10' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KAMIL SOSIS MINI ISI 10', 'SKU-OWGG3M', 'PCS', 0, 0, 'Umum', 29)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 29 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 29
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 29);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KEBAB FROZEN 10PCS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KEBAB FROZEN 10PCS', 'SKU-1PFOOF', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KEBAB MINI ORI' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KEBAB MINI ORI', 'SKU-PDKS7J', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KEBAB MINI PEDAS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KEBAB MINI PEDAS', 'SKU-ELU57F', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KECAP BANGO 189GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KECAP BANGO 189GR', 'SKU-02JTW6', 'PCS', 0, 0, 'Umum', 47)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 47 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 47
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 47);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KECAP MANIS ABC 130 ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KECAP MANIS ABC 130 ML', 'SKU-YM3RKV', 'PCS', 0, 0, 'Umum', 6)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 6 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 6
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 6);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KEJU CHEDAR GOLD PROCHIZ 160GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KEJU CHEDAR GOLD PROCHIZ 160GR', 'SKU-LWQJLS', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KEJU CHEDAR WINCHEEZ 250GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KEJU CHEDAR WINCHEEZ 250GR', 'SKU-V281H6', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KEJU PROCHIZ MOZARELLA 160GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KEJU PROCHIZ MOZARELLA 160GR', 'SKU-P9S7NB', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KEJU PROCHIZ QUICK MELT 160GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KEJU PROCHIZ QUICK MELT 160GR', 'SKU-6MYZ5T', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KEJU PROCHIZ SLICE ORI ISI 10' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KEJU PROCHIZ SLICE ORI ISI 10', 'SKU-R5EQDO', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KEJU PROCHIZ SLICE ORI ISI 5' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KEJU PROCHIZ SLICE ORI ISI 5', 'SKU-SRIOOA', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KEJU PROCHIZ SLICE QUICK MELT' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KEJU PROCHIZ SLICE QUICK MELT', 'SKU-GXV0Y0', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KEJU PROCHIZ SPREADY 160GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KEJU PROCHIZ SPREADY 160GR', 'SKU-9XUYHE', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENTANG CRINGKEL 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENTANG CRINGKEL 1KG', 'SKU-UC5RF9', 'PCS', 0, 0, 'Umum', 1)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 1 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 1
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 1);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENTANG CRINGKLE 2KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENTANG CRINGKLE 2KG', 'SKU-YZPVG6', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENTANG SHOESTRING 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENTANG SHOESTRING 1KG', 'SKU-MVWJU2', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENTANG SHOESTRING 2,5 KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENTANG SHOESTRING 2,5 KG', 'SKU-TJVXMC', 'PCS', 0, 0, 'Umum', 1)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 1 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 1
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 1);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENTANG SHOESTRING 2KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENTANG SHOESTRING 2KG', 'SKU-MGAPP5', 'PCS', 0, 0, 'Umum', 10)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 10 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 10
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 10);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENTANG STRAIGHT 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENTANG STRAIGHT 1KG', 'SKU-58JTAH', 'PCS', 0, 0, 'Umum', 3)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 3 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 3
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 3);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENTANG WEDGES 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENTANG WEDGES 1KG', 'SKU-0GWAFZ', 'PCS', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENZLER BAKSO SINGLES HOT' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENZLER BAKSO SINGLES HOT', 'SKU-BQYAJ7', 'PACK', 0, 0, 'Umum', 189)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 189 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 189
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 189);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENZLER BAKSO SINGLES ORI' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENZLER BAKSO SINGLES ORI', 'SKU-DW1MKH', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENZLER NUGGET CRISPY 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENZLER NUGGET CRISPY 500GR', 'SKU-58T9T4', 'PCS', 0, 0, 'Umum', 21)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 21 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 21
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 21);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENZLER NUGGET CRISPY SPICY' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENZLER NUGGET CRISPY SPICY', 'SKU-3MUKC7', 'PCS', 0, 0, 'Umum', 67)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 67 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 67
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 67);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENZLER NUGGET CRISPY STIK' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENZLER NUGGET CRISPY STIK', 'SKU-I1S8K0', 'PACK', 0, 0, 'Umum', 34)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 34 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 34
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 34);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENZLER NUGGET ORI 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENZLER NUGGET ORI 500GR', 'SKU-HHKUUQ', 'PACK', 0, 0, 'Umum', 25)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 25 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 25
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 25);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENZLER SOSIS COKTAIL AYAM 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENZLER SOSIS COKTAIL AYAM 500GR', 'SKU-UQ0BPQ', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENZLER SOSIS COKTAIL SAPI 500G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENZLER SOSIS COKTAIL SAPI 500G', 'SKU-F5A7TF', 'PCS', 0, 0, 'Umum', 16)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 16 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 16
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 16);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENZLER SOSIS SINGLES HOT' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENZLER SOSIS SINGLES HOT', 'SKU-0UP10F', 'PACK', 0, 0, 'Umum', 181)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 181 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 181
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 181);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KENZLER SOSIS SINGLES ORI' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KENZLER SOSIS SINGLES ORI', 'SKU-5PQV76', 'PACK', 0, 0, 'Umum', 7)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 7 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 7
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 7);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KERANG HIJAU BERSIH 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KERANG HIJAU BERSIH 1KG', 'SKU-89WRA2', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KIKOMAN LADA HITAM 300GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KIKOMAN LADA HITAM 300GR', 'SKU-E6F5L8', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KIKOMAN BBQ 300GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KIKOMAN BBQ 300GR', 'SKU-V5VFKR', 'PCS', 0, 0, 'Umum', 17)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 17 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 17
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 17);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'BTL', 'Satuan BTL'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'BTL');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KIKOMAN BULGOGI 300GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KIKOMAN BULGOGI 300GR', 'SKU-MNEPBO', 'BTL', 0, 0, 'Umum', 13)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 13 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 13
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 13);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KIKOMAN KECAP ASIN 150GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KIKOMAN KECAP ASIN 150GR', 'SKU-QDZ6YQ', 'PCS', 0, 0, 'Umum', 18)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 18 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 18
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 18);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KIKOMAN SAUS PEDAS 300GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KIKOMAN SAUS PEDAS 300GR', 'SKU-8EFHHV', 'PCS', 0, 0, 'Umum', 12)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 12 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 12
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 12);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KIKOMAN TERIYAKI BWG 300GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KIKOMAN TERIYAKI BWG 300GR', 'SKU-JRASQJ', 'PCS', 0, 0, 'Umum', 18)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 18 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 18
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 18);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KONGKEE TOFU AYAM' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KONGKEE TOFU AYAM', 'SKU-2X2SIT', 'PCS', 0, 0, 'Umum', 10)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 10 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 10
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 10);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KONGKEE TOFU TELUR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KONGKEE TOFU TELUR', 'SKU-5GSO7M', 'PCS', 0, 0, 'Umum', 8)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 8 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 8
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 8);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KONGKEE TOFU UDANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KONGKEE TOFU UDANG', 'SKU-5CEDNG', 'PCS', 0, 0, 'Umum', 10)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 10 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 10
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 10);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KULIT DIMSUM IKEA ISI 50' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KULIT DIMSUM IKEA ISI 50', 'SKU-NNSITJ', 'PCS', 0, 0, 'Umum', 95)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 95 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 95
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 95);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KULIT GYOZA' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KULIT GYOZA', 'SKU-Z3POWE', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KULIT KEBAB ALADIN' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KULIT KEBAB ALADIN', 'SKU-WV86P8', 'PCS', 0, 0, 'Umum', 1)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 1 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 1
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 1);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KULIT KEBAB TORTILA' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KULIT KEBAB TORTILA', 'SKU-HQATIA', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KULIT LUMPIA ASSHOFA' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KULIT LUMPIA ASSHOFA', 'SKU-ZQR7DB', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KULIT LUMPIA BULAT POLOS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KULIT LUMPIA BULAT POLOS', 'SKU-HHPHUX', 'PCS', 0, 0, 'Umum', 159)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 159 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 159
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 159);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KULIT LUMPIA BULAT TIPTOP' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KULIT LUMPIA BULAT TIPTOP', 'SKU-1QOQJJ', 'PCS', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'KULIT PANGSIT 450GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('KULIT PANGSIT 450GR', 'SKU-XGC9XX', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'M FLORIDINA ORANGE 350ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('M FLORIDINA ORANGE 350ML', 'SKU-VBMB4F', 'PCS', 0, 0, 'Umum', 3)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 3 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 3
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 3);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'M LE MINERALE 600ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('M LE MINERALE 600ML', 'SKU-ZJ09IU', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'M TEH KOTAK 300ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('M TEH KOTAK 300ML', 'SKU-JC5NIY', 'PCS', 0, 0, 'Umum', 15)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 15 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 15
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 15);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'M TEH PUCUK 350ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('M TEH PUCUK 350ML', 'SKU-6V18JV', 'PCS', 0, 0, 'Umum', 15)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 15 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 15
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 15);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'M ULTRA MILK COKLAT 200ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('M ULTRA MILK COKLAT 200ML', 'SKU-HMCM78', 'PCS', 0, 0, 'Umum', 6)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 6 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 6
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 6);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'M ULTRA MILK STOBERI 200ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('M ULTRA MILK STOBERI 200ML', 'SKU-GAVMWM', 'PCS', 0, 0, 'Umum', 19)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 19 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 19
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 19);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MAYONAIS MAESTRO 180GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MAYONAIS MAESTRO 180GR', 'SKU-BIE606', 'PCS', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MAYONAIS MAESTRO 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MAYONAIS MAESTRO 1KG', 'SKU-167I7K', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MAYONAIS MAMAYO 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MAYONAIS MAMAYO 1KG', 'SKU-YKYNPE', 'PCS', 0, 0, 'Umum', 86)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 86 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 86
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 86);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MAYONAIS MAMAYO 200G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MAYONAIS MAMAYO 200G', 'SKU-V5SS6V', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MAYONAIS MAMAYO 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MAYONAIS MAMAYO 500GR', 'SKU-OEPUR2', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MAYONAISE MAESTRO 100GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MAYONAISE MAESTRO 100GR', 'SKU-2FHOKB', 'PCS', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MAYONASI MC LEWIS ORI' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MAYONASI MC LEWIS ORI', 'SKU-FY8FXO', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MAYONASI MC LEWIS SWEET' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MAYONASI MC LEWIS SWEET', 'SKU-PTEE3J', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MC LEWIS SPICY BBQ' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MC LEWIS SPICY BBQ', 'SKU-324PQV', 'PACK', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MENTEGA FILMA' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MENTEGA FILMA', 'SKU-KL6FU8', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MINI POU RASA AYAM' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MINI POU RASA AYAM', 'SKU-MURJVZ', 'PCS', 0, 0, 'Umum', 8)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 8 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 8
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 8);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MINI POU RASA COKLAT' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MINI POU RASA COKLAT', 'SKU-NIXZPY', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MINI POU RASA SAPI' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MINI POU RASA SAPI', 'SKU-BN3626', 'PCS', 0, 0, 'Umum', 8)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 8 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 8
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 8);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MINI POU STOBERI' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MINI POU STOBERI', 'SKU-WF9BFH', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MINYAK GORENG JAR 2L' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MINYAK GORENG JAR 2L', 'SKU-68V2T3', 'PCS', 0, 0, 'Umum', 12)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 12 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 12
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 12);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MINYAK WIJEN' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MINYAK WIJEN', 'SKU-CWO4C1', 'PCS', 0, 0, 'Umum', 13)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 13 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 13
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 13);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MIX VEGETABLE 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MIX VEGETABLE 1KG', 'SKU-HSLO6Y', 'PCS', 0, 0, 'Umum', 239)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 239 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 239
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 239);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'MOZARELLA DELS 250GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('MOZARELLA DELS 250GR', 'SKU-87AEGF', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'NUGGET AKUMO 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('NUGGET AKUMO 500GR', 'SKU-LKNN8F', 'PCS', 0, 0, 'Umum', 12)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 12 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 12
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 12);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'NUGGET ASIMO 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('NUGGET ASIMO 500GR', 'SKU-DEWN9X', 'PCS', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'OKEY NUGGET 500G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('OKEY NUGGET 500G', 'SKU-174U7M', 'PCS', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'OKEY SOSIS 500G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('OKEY SOSIS 500G', 'SKU-YVXS6F', 'PCS', 0, 0, 'Umum', 18)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 18 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 18
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 18);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'OLAHAN BEBEK BEGOK' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('OLAHAN BEBEK BEGOK', 'SKU-PHTK25', 'PCS', 0, 0, 'Umum', 1)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 1 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 1
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 1);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'OLAHAN NUGGET CIRENG BAROKAH' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('OLAHAN NUGGET CIRENG BAROKAH', 'SKU-KD01TL', 'PCS', 0, 0, 'Umum', 3)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 3 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 3
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 3);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'OLAHAN SATE USUS' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('OLAHAN SATE USUS', 'SKU-5OCF3V', 'PCS', 0, 0, 'Umum', 7)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 7 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 7
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 7);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'OLAHAN SOSIS MIE BAROKAH' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('OLAHAN SOSIS MIE BAROKAH', 'SKU-8I1Y9S', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'PAHA AYAM GILING 500G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('PAHA AYAM GILING 500G', 'SKU-E0WABC', 'PCS', 0, 0, 'Umum', 1)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 1 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 1
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 1);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'PUFF PASTRY 750GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('PUFF PASTRY 750GR', 'SKU-S94OAA', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'RIOS PIZZA' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('RIOS PIZZA', 'SKU-F5Z80T', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ROTI BURGER BERNADI 6' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ROTI BURGER BERNADI 6', 'SKU-E9MNCA', 'PCS', 0, 0, 'Umum', 15)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 15 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 15
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 15);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ROTI MARYAM' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ROTI MARYAM', 'SKU-26O977', 'PCS', 0, 0, 'Umum', 3)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 3 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 3
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 3);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ROTI MARYAM CENTRAL 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ROTI MARYAM CENTRAL 500GR', 'SKU-BP33CW', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ROYCO AYAM RENTENG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ROYCO AYAM RENTENG', 'SKU-L11KCK', 'PCS', 0, 0, 'Umum', 46)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 46 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 46
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 46);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ROYCO SAPI RENTENG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ROYCO SAPI RENTENG', 'SKU-E39WFB', 'PCS', 0, 0, 'Umum', 47)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 47 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 47
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 47);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM BAKSO AYAM 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM BAKSO AYAM 500GR', 'SKU-RHGAR1', 'PCS', 0, 0, 'Umum', 17)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 17 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 17
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 17);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM BAKSO BAKAR 700GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM BAKSO BAKAR 700GR', 'SKU-YRBAJK', 'PCS', 0, 0, 'Umum', 6)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 6 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 6
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 6);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM BAKSO KERIKIL 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM BAKSO KERIKIL 500GR', 'SKU-HCANT9', 'PCS', 0, 0, 'Umum', 20)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 20 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 20
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 20);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM BAKSO SAPI 500G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM BAKSO SAPI 500G', 'SKU-XWNXZ8', 'PCS', 0, 0, 'Umum', 23)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 23 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 23
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 23);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM KORNET AYAM 450G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM KORNET AYAM 450G', 'SKU-1ASTPN', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM NUGGET AYAM 250G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM NUGGET AYAM 250G', 'SKU-C04NSH', 'PCS', 0, 0, 'Umum', 20)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 20 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 20
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 20);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM NUGGET LOVE 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM NUGGET LOVE 1KG', 'SKU-FQJ1R2', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM NUGGET LOVE 500' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM NUGGET LOVE 500', 'SKU-NSEJQU', 'PCS', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM NUGGET STICK 500G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM NUGGET STICK 500G', 'SKU-Y4NIZY', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM SOSIS AYAM 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM SOSIS AYAM 1KG', 'SKU-LYK9Y0', 'PCS', 0, 0, 'Umum', 12)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 12 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 12
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 12);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM SOSIS AYAM 500' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM SOSIS AYAM 500', 'SKU-UZ8OIP', 'PCS', 0, 0, 'Umum', 25)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 25 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 25
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 25);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM SOSIS JUMBO ISI 12' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM SOSIS JUMBO ISI 12', 'SKU-P96F5U', 'PCS', 0, 0, 'Umum', 16)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 16 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 16
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 16);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM SOSIS JUMBO ISI 8' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM SOSIS JUMBO ISI 8', 'SKU-G6RAUU', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM SOSIS SAPI 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM SOSIS SAPI 1KG', 'SKU-7BFW9R', 'PCS', 0, 0, 'Umum', 14)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 14 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 14
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 14);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALAM SOSIS SAPI 500' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALAM SOSIS SAPI 500', 'SKU-ZHR12K', 'PCS', 0, 0, 'Umum', 25)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 25 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 25
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 25);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SALMON FILLET' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SALMON FILLET', 'SKU-4TFZPL', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SAORI SAOS TIRAM 133 ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SAORI SAOS TIRAM 133 ML', 'SKU-BXQIV7', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SAOS EXTRA PEDAS ABC 130 ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SAOS EXTRA PEDAS ABC 130 ML', 'SKU-WVMM2F', 'PCS', 0, 0, 'Umum', 3)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 3 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 3
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 3);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SAOS SAMBAL ASLI ABC 130 ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SAOS SAMBAL ASLI ABC 130 ML', 'SKU-BAG1AQ', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SAOS TOMAT ABC 130 ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SAOS TOMAT ABC 130 ML', 'SKU-DZ07TU', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SARANA TETELAN 500G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SARANA TETELAN 500G', 'SKU-4RBZ21', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SARDEN ABC CABAI 155GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SARDEN ABC CABAI 155GR', 'SKU-5XC5X9', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SARIWANGI TEH ISI 25' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SARIWANGI TEH ISI 25', 'SKU-CSPTWN', 'PCS', 0, 0, 'Umum', 48)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 48 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 48
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 48);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SAUS TAR-TAR 250GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SAUS TAR-TAR 250GR', 'SKU-01WA27', 'PCS', 0, 0, 'Umum', 16)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 16 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 16
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 16);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SIOMAY MAJU MAPAN' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SIOMAY MAJU MAPAN', 'SKU-HXJPN6', 'PCS', 0, 0, 'Umum', 3)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 3 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 3
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 3);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SO ECO NUGGET 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SO ECO NUGGET 1KG', 'SKU-LGWDQZ', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PACK', 'Satuan PACK'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PACK');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SO ECO NUGGET 500 GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SO ECO NUGGET 500 GR', 'SKU-OUXS84', 'PACK', 0, 0, 'Umum', 70)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 70 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 70
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 70);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SO ECO NUGGET STICK 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SO ECO NUGGET STICK 1KG', 'SKU-GKYBGF', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SO ECO NUGGET STICK 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SO ECO NUGGET STICK 500GR', 'SKU-10LUNS', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SO GOOD NUGGET DINOBITES 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SO GOOD NUGGET DINOBITES 500GR', 'SKU-SHIL64', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SO NICE NUGGET AYAM 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SO NICE NUGGET AYAM 500GR', 'SKU-UWZWX1', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SO NICE NUGGET STICK 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SO NICE NUGGET STICK 500GR', 'SKU-EF86Q9', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SO NICE SOSIS BAKAR 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SO NICE SOSIS BAKAR 500GR', 'SKU-V1DSNK', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SOSIS ASIMO 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SOSIS ASIMO 500GR', 'SKU-ZAUTHW', 'PCS', 0, 0, 'Umum', 22)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 22 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 22
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 22);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'STKS MR MAX COKTAIL MERAH 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('STKS MR MAX COKTAIL MERAH 500GR', 'SKU-U3683D', 'PCS', 0, 0, 'Umum', 17)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 17 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 17
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 17);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'STKS MR MAX KENTANG SHOESTRING 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('STKS MR MAX KENTANG SHOESTRING 1KG', 'SKU-Q3EGGU', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'STKS MR MAX OTAK-OTAK 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('STKS MR MAX OTAK-OTAK 500GR', 'SKU-APFL0U', 'PCS', 0, 0, 'Umum', 31)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 31 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 31
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 31);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'STKS MR MAX SOSIS JUMBO ISI 8 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('STKS MR MAX SOSIS JUMBO ISI 8 500GR', 'SKU-2X275A', 'PCS', 0, 0, 'Umum', 14)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 14 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 14
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 14);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'STKS MR MAX SOSIS KEJU 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('STKS MR MAX SOSIS KEJU 500GR', 'SKU-FFN71J', 'PCS', 0, 0, 'Umum', 8)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 8 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 8
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 8);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'STKS MR MAX SOSIS MINI ISI 12' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('STKS MR MAX SOSIS MINI ISI 12', 'SKU-7KZLHU', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'STOBERI BUAH FROZEN' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('STOBERI BUAH FROZEN', 'SKU-QBNGZJ', 'PCS', 0, 0, 'Umum', 7)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 7 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 7
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 7);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'SUSHI NORI 10 SHEET' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('SUSHI NORI 10 SHEET', 'SKU-GIEQGM', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TAHU BAKSO MAJU MAPAN' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TAHU BAKSO MAJU MAPAN', 'SKU-H31T6G', 'PCS', 0, 0, 'Umum', 3)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 3 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 3
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 3);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEMAN LAUT BAKSO IKAN 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEMAN LAUT BAKSO IKAN 500GR', 'SKU-SQV6N6', 'PCS', 0, 0, 'Umum', 12)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 12 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 12
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 12);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEMAN LAUT BAKSO UDANG 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEMAN LAUT BAKSO UDANG 500GR', 'SKU-SKGPMT', 'PCS', 0, 0, 'Umum', 13)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 13 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 13
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 13);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEMAN LAUT BASO CUMI 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEMAN LAUT BASO CUMI 500GR', 'SKU-R97S0Y', 'PCS', 0, 0, 'Umum', 10)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 10 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 10
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 10);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'EKOR', 'Satuan EKOR'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'EKOR');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEMAN LAUT COIN STAR 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEMAN LAUT COIN STAR 500GR', 'SKU-3MPA9L', 'EKOR', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEMAN LAUT FISH COIN 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEMAN LAUT FISH COIN 500GR', 'SKU-N0K811', 'PCS', 0, 0, 'Umum', 6)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 6 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 6
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 6);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEMPURA BFI 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEMPURA BFI 500GR', 'SKU-FT7YEK', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEPUNG KETAN HITAM 250 GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEPUNG KETAN HITAM 250 GR', 'SKU-N7VFWU', 'PCS', 0, 0, 'Umum', 1)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 1 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 1
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 1);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEPUNG KETAN HITAM 500 GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEPUNG KETAN HITAM 500 GR', 'SKU-4XXM2Z', 'PCS', 0, 0, 'Umum', 3)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 3 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 3
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 3);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEPUNG ROTI/PANIR 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEPUNG ROTI/PANIR 1KG', 'SKU-NNCANZ', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEPUNG ROTI/PANIR 250GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEPUNG ROTI/PANIR 250GR', 'SKU-VN91YJ', 'PCS', 0, 0, 'Umum', 10)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 10 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 10
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 10);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEPUNG ROTI/PANIR 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEPUNG ROTI/PANIR 500GR', 'SKU-SOGPA8', 'PCS', 0, 0, 'Umum', 11)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 11 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 11
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 11);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEPUNG SAJIKU 210GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEPUNG SAJIKU 210GR', 'SKU-WMYZ1H', 'PCS', 0, 0, 'Umum', 39)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 39 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 39
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 39);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEPUNG TERIGU 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEPUNG TERIGU 1KG', 'SKU-SLRWFL', 'PCS', 0, 0, 'Umum', 6)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 6 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 6
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 6);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TEPUNG TERIGU 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TEPUNG TERIGU 500GR', 'SKU-TUKJX9', 'PCS', 0, 0, 'Umum', 38)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 38 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 38
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 38);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'TETELAN LEMAK SAPI 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('TETELAN LEMAK SAPI 500GR', 'SKU-RJIA35', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'UDANG COOK KUPAS 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('UDANG COOK KUPAS 500GR', 'SKU-UCVCFH', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'VITALIA BEEF BURGER KECIL' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('VITALIA BEEF BURGER KECIL', 'SKU-Z70O0U', 'PCS', 0, 0, 'Umum', 13)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 13 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 13
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 13);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'WIJEN SANGRAI 237ML' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('WIJEN SANGRAI 237ML', 'SKU-SPDAVQ', 'PCS', 0, 0, 'Umum', 5)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 5 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 5
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 5);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'YONNA BEEF PATTIES' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('YONNA BEEF PATTIES', 'SKU-UCPTTY', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'YONNA CHICKEN BURGER' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('YONNA CHICKEN BURGER', 'SKU-7VEZPN', 'PCS', 0, 0, 'Umum', 2)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 2 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 2
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 2);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'YONNA SMOKE BEEF' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('YONNA SMOKE BEEF', 'SKU-1X2N5H', 'PCS', 0, 0, 'Umum', 8)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 8 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 8
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 8);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'YONNA SOSIS 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('YONNA SOSIS 1KG', 'SKU-5RVTON', 'PCS', 0, 0, 'Umum', 1)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 1 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 1
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 1);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZAITUN CHICKEN KARAGE' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZAITUN CHICKEN KARAGE', 'SKU-1LVH17', 'PCS', 0, 0, 'Umum', 17)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 17 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 17
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 17);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZAITUN CHICKEN KATSU' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZAITUN CHICKEN KATSU', 'SKU-WWTIFV', 'PCS', 0, 0, 'Umum', 14)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 14 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 14
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 14);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZAITUN KULIT CRISPY 250GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZAITUN KULIT CRISPY 250GR', 'SKU-I3QB4O', 'PCS', 0, 0, 'Umum', 4)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 4 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 4
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 4);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZAITUN NUGGET CRISPY 500' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZAITUN NUGGET CRISPY 500', 'SKU-DIS5Y9', 'PCS', 0, 0, 'Umum', 14)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 14 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 14
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 14);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZAITUN SOSIS AYAM 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZAITUN SOSIS AYAM 1KG', 'SKU-3TOLNH', 'PCS', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZAITUN SOSIS AYAM 500G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZAITUN SOSIS AYAM 500G', 'SKU-MD5UPG', 'PCS', 0, 0, 'Umum', 20)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 20 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 20
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 20);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZAITUN SOSIS COCKTAIL 500G' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZAITUN SOSIS COCKTAIL 500G', 'SKU-FYLFAL', 'PCS', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZAITUN SOSIS SAPI 1KG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZAITUN SOSIS SAPI 1KG', 'SKU-8HX24T', 'PCS', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZAITUN SOSIS SAPI 500GR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZAITUN SOSIS SAPI 500GR', 'SKU-842Z1B', 'PCS', 0, 0, 'Umum', 28)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 28 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 28
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 28);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZAITUN SPICY WING 500' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZAITUN SPICY WING 500', 'SKU-0OBN5K', 'PCS', 0, 0, 'Umum', 9)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 9 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 9
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 9);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZDAGING RENDANG STANDAR' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZDAGING RENDANG STANDAR', 'SKU-N6FXG5', 'KG', 0, 0, 'Umum', 0.022)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0.022 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0.022
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0.022);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'PCS', 'Satuan PCS'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'PCS');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZZ BEBEK 1.5 CP/RAJA/BEBEKU' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZZ BEBEK 1.5 CP/RAJA/BEBEKU', 'SKU-T6MM7X', 'PCS', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZZ IGA GONDRONG TIMBANG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZZ IGA GONDRONG TIMBANG', 'SKU-7YPSD7', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZZ PTG' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZZ PTG', 'SKU-OSU451', 'KG', 0, 0, 'Umum', 0)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZZ PTG 5' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZZ PTG 5', 'SKU-RIVZVA', 'KG', 0, 0, 'Umum', 0.001)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0.001 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0.001
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0.001);
    END IF;

    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT 'KG', 'Satuan KG'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = 'KG');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = 'ZZ PTG 8' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('ZZ PTG 8', 'SKU-LNU8AO', 'KG', 0, 0, 'Umum', 0.0001)
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + 0.0001 WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + 0.0001
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, 0.0001);
    END IF;

END $$;
