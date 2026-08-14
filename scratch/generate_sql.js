const fs = require('fs')

function generate() {
  const text = fs.readFileSync('scratch/products.txt', 'utf-8')
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  
  let sql = `
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
`

  for (const line of lines) {
    const parts = line.split(' ')
    if (parts.length < 3) continue

    const rawStock = parts.pop().replace(',', '.')
    const stock = parseFloat(rawStock)
    const unit = parts.pop().replace(/'/g, "''")
    const name = parts.join(' ').replace(/'/g, "''")
    
    const sku = 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    
    sql += `
    -- Pastikan satuan ada
    INSERT INTO public.units (name, description)
    SELECT '${unit}', 'Satuan ${unit}'
    WHERE NOT EXISTS (SELECT 1 FROM public.units WHERE name = '${unit}');

    -- Insert/Update Product
    SELECT id INTO v_product_id FROM public.products WHERE name = '${name}' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, sku, unit, hpp, price_retail, category, stock_quantity)
        VALUES ('${name}', '${sku}', '${unit}', 0, 0, 'Umum', ${stock})
        RETURNING id INTO v_product_id;
    ELSE
        -- Update stok utama legacy column
        UPDATE public.products SET stock_quantity = stock_quantity + ${stock} WHERE id = v_product_id;
    END IF;

    -- Insert/Update Product Stocks (Multi-branch)
    IF EXISTS (SELECT 1 FROM public.product_stocks WHERE product_id = v_product_id AND branch_id = v_branch_id) THEN
        UPDATE public.product_stocks 
        SET stock_quantity = stock_quantity + ${stock}
        WHERE product_id = v_product_id AND branch_id = v_branch_id;
    ELSE
        INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity)
        VALUES (v_product_id, v_branch_id, ${stock});
    END IF;
`
  }

  sql += `
END $$;
`
  
  fs.writeFileSync('scratch/import_stok.sql', sql)
  console.log('SQL Generated: scratch/import_stok.sql')
}

generate()
