const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need to make sure this exists or use Anon with RLS disabled?

// Since we're running locally with anon key usually for these scripts, let's just use the Anon key if RLS allows it, or Service Role Key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  // Get first branch
  const { data: branches, error: branchError } = await supabase.from('branches').select('id').limit(1)
  if (branchError) {
    console.error('Error fetching branches:', branchError)
    return
  }
  
  const branchId = branches[0]?.id
  if (!branchId) {
    console.error('No branch found!')
    return
  }

  const text = fs.readFileSync('scratch/products.txt', 'utf-8')
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  
  let successCount = 0
  let errorCount = 0

  for (const line of lines) {
    // Format is usually: [Name words...] [Unit] [Stock]
    // Stock is the last token. It might have comma for decimals e.g., 1623,5047
    // Unit is the second to last token.
    
    const parts = line.split(' ')
    if (parts.length < 3) {
      console.log('Skipping invalid line:', line)
      continue
    }

    const rawStock = parts.pop().replace(',', '.')
    const stock = parseFloat(rawStock)
    const unit = parts.pop()
    const name = parts.join(' ')
    
    // Generate simple SKU
    const sku = 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Check if product exists (by name)
    const { data: existing } = await supabase.from('products').select('id').eq('name', name).maybeSingle()
    
    let productId = null
    
    if (!existing) {
      // Insert product
      const { data: newProd, error: insertError } = await supabase.from('products').insert({
        name,
        sku,
        unit,
        stock_quantity: stock, // duplicate column for legacy compatibility if it exists
        hpp: 0,
        price_retail: 0
      }).select('id').single()
      
      if (insertError) {
        console.error('Error inserting product', name, ':', insertError.message)
        errorCount++
        continue
      }
      productId = newProd.id
    } else {
      productId = existing.id
      // Optional: update unit or just stock
    }
    
    // Update or insert product_stocks
    if (productId && branchId) {
      const { data: currentStock } = await supabase
        .from('product_stocks')
        .select('id')
        .eq('product_id', productId)
        .eq('branch_id', branchId)
        .maybeSingle()
        
      if (currentStock) {
         await supabase.from('product_stocks').update({ stock_quantity: stock }).eq('id', currentStock.id)
      } else {
         await supabase.from('product_stocks').insert({
           product_id: productId,
           branch_id: branchId,
           stock_quantity: stock
         })
      }
    }
    
    // Also make sure unit is in the units table
    const { data: existingUnit } = await supabase.from('units').select('id').eq('name', unit).maybeSingle()
    if (!existingUnit) {
      await supabase.from('units').insert({ name: unit })
    }
    
    successCount++
    console.log(`Imported: ${name} (${stock} ${unit})`)
  }
  
  console.log(`\nDone! Imported ${successCount} products. Errors: ${errorCount}`)
}

seed()
