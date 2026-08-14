'use server'

import { createClient } from '@supabase/supabase-js'

export async function createTeamUser(data: {
  email: string
  password: string
  fullName: string
  role: 'super_admin' | 'admin_gudang' | 'kasir' | 'sales'
  branch_id?: string
}) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY // HARUS ADA DI .env.local

    if (!supabaseUrl || !serviceRoleKey) {
      return { 
        success: false, 
        error: 'Sistem belum dikonfigurasi dengan Supabase Service Role Key. Silakan tambahkan SUPABASE_SERVICE_ROLE_KEY di pengaturan Vercel atau .env.local' 
      }
    }

    // Gunakan admin client khusus
    const adminAuthClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Buat user di Supabase Auth (Tanpa melogout admin saat ini)
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Otomatis aktif
      user_metadata: {
        full_name: data.fullName,
        role: data.role
      }
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    // Update role dan branch_id
    if (authData.user) {
      const updates: any = {}
      if (data.role !== 'kasir') updates.role = data.role
      if (data.role !== 'super_admin' && data.branch_id) updates.branch_id = data.branch_id

      if (Object.keys(updates).length > 0) {
        const { error: profileError } = await adminAuthClient
          .from('profiles')
          .update(updates)
          .eq('id', authData.user.id)

        if (profileError) {
          return { success: false, error: 'User dibuat tapi gagal set role/cabang. Silakan edit manual di tabel.' }
        }
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem' }
  }
}
