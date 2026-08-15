import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'
import { GlobalHeader } from '@/components/shared/GlobalHeader'
import { TopTabBar } from '@/components/shared/TopTabBar'
import { Toaster } from 'react-hot-toast'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: {
    template: '%s | SBR Frozen',
    default: 'Dashboard | SBR Frozen',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SBR POS',
    startupImage: '/icon-512.jpg',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon-192.jpg',
    apple: '/icon-192.jpg',
    shortcut: '/icon-192.jpg',
  },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status === 'inactive') {
    await supabase.auth.signOut()
    redirect('/login')
  }

  // Fetch branches for Super Admin
  let branches: any[] = []
  let activeBranchId = null

  if (profile.role === 'super_admin') {
    const { data } = await supabase.from('branches').select('*').order('created_at', { ascending: true })
    if (data) branches = data
    activeBranchId = cookies().get('active_branch_id')?.value || null
  }

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white print:min-h-0 print:block">
      <div className="print:hidden">
        <Sidebar userRole={profile.role} userName={profile.full_name} />
      </div>

      {/* Main content area */}
      <main className="lg:pl-[72px] transition-all duration-300 min-h-screen flex flex-col print:pl-0 print:min-h-0 print:block">
        {/* Global Header */}
        <div className="print:hidden">
          <GlobalHeader 
            userName={profile.full_name} 
            userRole={profile.role} 
            branches={branches} 
            activeBranchId={activeBranchId || undefined} 
          />
        </div>

        {/* Top Tab Bar (Multi-Jendela) */}
        <div className="print:hidden">
          <TopTabBar />
        </div>

        <div className="flex-1 lg:pt-0 print:pt-0 print:block">
          {children}
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />
    </div>
  )
}
