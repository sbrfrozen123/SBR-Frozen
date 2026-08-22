const fs = require('fs');
const path = 'c:/Projects/SBR Frozen/src/app/(dashboard)/shifts/shifts-client.tsx';
let content = fs.readFileSync(path, 'utf8');

const old_fetch = `        const { data: txns } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', shift.user_id)
          .gte('created_at', shift.start_time)
          .lte('created_at', endTime)
          .eq('order_status', 'completed')
          
        if (!txns || txns.length === 0) return { ...shift, shiftItems: [] }
        
        const txnIds = txns.map(t => t.id)
        const { data: items } = await supabase
          .from('transaction_items')
          .select('product_name, qty, subtotal')
          .in('transaction_id', txnIds)
          
        const aggregated = (items || []).reduce((acc: any, curr: any) => {
          if (!acc[curr.product_name]) {
            acc[curr.product_name] = { name: curr.product_name, qty: 0, subtotal: 0 }
          }
          acc[curr.product_name].qty += curr.qty
          acc[curr.product_name].subtotal += curr.subtotal
          return acc
        }, {})
        
        return {
          ...shift,
          shiftItems: Object.values(aggregated).sort((a: any, b: any) => b.qty - a.qty)
        }`;

const new_fetch = `        const { data: txns } = await supabase
          .from('transactions')
          .select('id, payment_method, amount_paid, total_amount')
          .eq('user_id', shift.user_id)
          .gte('created_at', shift.start_time)
          .lte('created_at', endTime)
          .eq('order_status', 'completed')
          
        if (!txns || txns.length === 0) return { ...shift, shiftItems: [], totalCash: 0, totalTransfer: 0, totalPiutang: 0 }
        
        const totalCash = txns.filter(t => t.payment_method === 'tunai' || t.payment_method === 'cash' || t.payment_method === 'tempo').reduce((sum, t) => sum + (t.amount_paid || 0), 0);
        const totalTransfer = txns.filter(t => ['transfer', 'qris'].includes(t.payment_method?.toLowerCase() || '')).reduce((sum, t) => sum + (t.amount_paid || 0), 0);
        const totalPiutang = txns.filter(t => t.payment_method === 'tempo').reduce((sum, t) => sum + ((t.total_amount || 0) - (t.amount_paid || 0)), 0);
        
        const txnIds = txns.map(t => t.id)
        const { data: items } = await supabase
          .from('transaction_items')
          .select('product_name, qty, subtotal')
          .in('transaction_id', txnIds)
          
        const aggregated = (items || []).reduce((acc: any, curr: any) => {
          if (!acc[curr.product_name]) {
            acc[curr.product_name] = { name: curr.product_name, qty: 0, subtotal: 0 }
          }
          acc[curr.product_name].qty += curr.qty
          acc[curr.product_name].subtotal += curr.subtotal
          return acc
        }, {})
        
        return {
          ...shift,
          shiftItems: Object.values(aggregated).sort((a: any, b: any) => b.qty - a.qty),
          totalCash,
          totalTransfer,
          totalPiutang
        }`;

content = content.replace(old_fetch, new_fetch);
fs.writeFileSync(path, content, 'utf8');
console.log('Update Success');
