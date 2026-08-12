'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, ShoppingCart, Users, Package,
  Receipt, FileText, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, AlertCircle, X, Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types/database'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  color: string
  roles: UserRole[]
  badge?: number
}

const navItems: NavItem[] = [
  {
    href: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
    color: 'text-indigo-400',
    roles: ['super_admin'],
  },
  {
    href: '/pos',
    icon: ShoppingCart,
    label: 'POS Kasir',
    color: 'text-pink-400',
    roles: ['super_admin', 'kasir'],
  },
  {
    href: '/customers',
    icon: Users,
    label: 'Database Customer',
    color: 'text-blue-400',
    roles: ['super_admin', 'kasir'],
  },
  {
    href: '/inventory',
    icon: Package,
    label: 'Database Stok',
    color: 'text-emerald-400',
    roles: ['super_admin', 'admin_gudang'],
  },
  {
    href: '/expenses',
    icon: Receipt,
    label: 'Pengeluaran',
    color: 'text-amber-400',
    roles: ['super_admin'],
  },
  {
    href: '/receivables',
    icon: AlertCircle,
    label: 'Piutang',
    color: 'text-red-400',
    roles: ['super_admin', 'kasir'],
  },
  {
    href: '/reports',
    icon: BarChart3,
    label: 'Laporan',
    color: 'text-violet-400',
    roles: ['super_admin'],
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Pengaturan',
    color: 'text-slate-400',
    roles: ['super_admin'],
  },
]

interface SidebarProps {
  userRole: UserRole
  userName: string
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const filtered = navItems.filter((item) => item.roles.includes(userRole))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-dark-800 flex-shrink-0',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">SBR POS</div>
              <div className="text-dark-500 text-xs">v1.0</div>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-white transition-all hidden lg:flex"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
        <div className="space-y-0.5">
          {filtered.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'sidebar-nav-item',
                  active && 'active',
                  collapsed && 'justify-center px-0 mx-3'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn('w-5 h-5 nav-icon flex-shrink-0', active ? 'text-primary-400' : item.color)} />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-dark-800 p-3 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{userName}</div>
              <div className="text-dark-500 text-xs capitalize">{userRole.replace('_', ' ')}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-dark-400 hover:text-danger hover:bg-danger-light/10 transition-all text-sm',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-dark-900 text-white flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 h-screen bg-dark-900 border-r border-dark-800 z-50 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'w-64'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-dark-900 border-r border-dark-800 z-40 transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
