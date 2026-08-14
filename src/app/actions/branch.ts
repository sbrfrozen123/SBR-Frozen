'use server'

import { cookies } from 'next/headers'

export async function setActiveBranch(branchId: string | null) {
  if (branchId) {
    cookies().set('active_branch_id', branchId, { path: '/' })
  } else {
    cookies().delete('active_branch_id')
  }
}

export async function getBranchContext(supabase: any, userId: string): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, branch_id')
    .eq('id', userId)
    .single()

  if (!profile) return null

  if (profile.role === 'super_admin') {
    const cookieBranchId = cookies().get('active_branch_id')?.value
    return cookieBranchId || null
  }

  // Kasir, Admin Gudang, Sales CAN ONLY access their own branch
  return profile.branch_id || null
}
