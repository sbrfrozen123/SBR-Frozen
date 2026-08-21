'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, ShoppingCart, Users, Package,
  Receipt, FileText, BarChart3, Settings, LogOut,
  X, Menu, ShoppingBag, Truck, Tags, Clock, AlertCircle, 
  ChevronRight, Scale, Landmark, ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types/database'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  roles: UserRole[]
}

interface ModuleGroup {
  id: string
  label: string
  icon: React.ElementType
  color: string
  roles: UserRole[]
  href?: string
  items?: NavItem[]
}

export const modules: ModuleGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    color: 'text-primary-500',
    roles: ['super_admin', 'kasir', 'admin_gudang'],
    href: '/'
  },
  {
    id: 'pos',
    label: 'Mesin Kasir (POS)',
    icon: ShoppingCart,
    color: 'text-blue-500',
    roles: ['super_admin', 'kasir'],
    href: '/pos'
  },
  {
    id: 'shift',
    label: 'Manajemen Shift',
    icon: Clock,
    color: 'text-orange-500',
    roles: ['super_admin', 'kasir'],
    href: '/shifts'
  },
  {
    id: 'inventory',
    label: 'Gudang & Stok',
    icon: Package,
    color: 'text-green-500',
    roles: ['super_admin', 'admin_gudang'],
    items: [
      { href: '/inventory', icon: Package, label: 'Data Barang', roles: ['super_admin', 'admin_gudang'] },
      { href: '/categories', icon: Tags, label: 'Kategori', roles: ['super_admin', 'admin_gudang'] },
      { href: '/units', icon: Package, label: 'Satuan (UoM)', roles: ['super_admin', 'admin_gudang'] },
      { href: '/warehouses', icon: Package, label: 'Gudang', roles: ['super_admin'] },
    ]
  },
  {
    id: 'purchasing',
    label: 'Pembelian & Pemasok',
    icon: ShoppingBag,
    color: 'text-purple-500',
    roles: ['super_admin', 'admin_gudang'],
    items: [
      { href: '/purchases', icon: ShoppingBag, label: 'Pembelian', roles: ['super_admin', 'admin_gudang'] },
      { href: '/suppliers', icon: Truck, label: 'Data Pemasok', roles: ['super_admin', 'admin_gudang'] },
    ]
  },
  {
    id: 'penjualan',
    label: 'Penjualan',
    icon: ShoppingBag,
    color: 'text-blue-600',
    roles: ['super_admin', 'kasir'],
    items: [
      { href: '/transactions', icon: FileText, label: 'Pesanan Penjualan', roles: ['super_admin', 'kasir'] },
      { href: '/customers', icon: Users, label: 'Pelanggan', roles: ['super_admin', 'kasir'] }
    ]
  },
  {
    id: 'keuangan',
    label: 'Keuangan',
    icon: Landmark,
    color: 'text-emerald-500',
    roles: ['super_admin'],
    items: [
      { href: '/cashflow', icon: FileText, label: 'Buku Kas', roles: ['super_admin'] },
      { href: '/expenses', icon: Receipt, label: 'Pengeluaran', roles: ['super_admin'] },
      { href: '/receivables', icon: Users, label: 'Piutang Pelanggan', roles: ['super_admin'] },
      { href: '/reports/financial/hutang', icon: FileText, label: 'Hutang', roles: ['super_admin'] }
    ]
  },
  {
    id: 'laporan',
    label: 'Laporan',
    icon: FileText,
    color: 'text-amber-500',
    roles: ['super_admin'],
    href: '/reports'
  },
  {
    id: 'pengaturan',
    label: 'Pengaturan',
    icon: Settings,
    color: 'text-slate-500',
    roles: ['super_admin'],
    href: '/settings'
  }
]

interface SidebarProps {
  userRole: UserRole
  userName: string
  customPermissions?: string[]
}

export function Sidebar({ userRole, userName, customPermissions = [] }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const supabase = createClient()
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty('--sidebar-width', isExpanded ? '240px' : '72px');
    }
  }, [isExpanded])

  const allowedModules = modules.map(m => {
    const roleHasAccess = m.roles.includes(userRole)
    const itemsAllowedByPerm = m.items?.filter(item => customPermissions.includes(item.href)) || []
    const permHasAccess = itemsAllowedByPerm.length > 0 || (m.href && customPermissions.includes(m.href))
    
    if (!roleHasAccess && !permHasAccess) return null
    
    const filteredItems = roleHasAccess 
      ? m.items?.filter(i => i.roles.includes(userRole) || customPermissions.includes(i.href))
      : itemsAllowedByPerm

    return { ...m, items: filteredItems }
  }).filter(Boolean) as ModuleGroup[]

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActiveModule(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const isModuleActive = (module: ModuleGroup) => {
    if (module.href === '/') return pathname === '/'
    if (module.href) return pathname.startsWith(module.href)
    return module.items?.some(item => pathname.startsWith(item.href))
  }

  const handleModuleClick = (mod: ModuleGroup) => {
    if (mod.href) {
      router.push(mod.href)
      setActiveModule(null)
      setMobileOpen(false)
    } else {
      setActiveModule(activeModule === mod.id ? null : mod.id)
    }
  }

  return (
    <div ref={sidebarRef}>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 rounded-xl bg-dark-900 text-white flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[40]"
          onClick={() => {
            setMobileOpen(false)
            setActiveModule(null)
          }}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-dark-900 border-r border-dark-800 z-[50] flex flex-col py-4 transition-all duration-300',
          isExpanded ? 'w-[240px] px-4' : 'w-[72px] items-center px-2',
          !mobileOpen && 'max-lg:-translate-x-full'
        )}
      >
        <Link href="/" className={cn("rounded-xl overflow-hidden relative mb-6 shadow-sm group mx-auto", isExpanded ? "w-16 h-16" : "w-10 h-10")}>
          <Image src="/logo.jpeg" alt="Logo" fill className="object-cover group-hover:scale-110 transition-transform" />
        </Link>

        <nav className="flex-1 w-full flex flex-col gap-2 overflow-y-auto no-scrollbar">
          {allowedModules.map((mod) => {
            const Icon = mod.icon
            const active = isModuleActive(mod) || activeModule === mod.id
            return (
              <button
                key={mod.id}
                onClick={() => handleModuleClick(mod)}
                className={cn(
                  'rounded-xl flex items-center relative group transition-all h-12',
                  isExpanded ? 'px-4 justify-start gap-3 w-full' : 'justify-center w-12 mx-auto',
                  active ? 'bg-primary-500/10 text-primary-500' : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                )}
                title={!isExpanded ? mod.label : undefined}
              >
                <Icon className={cn('w-6 h-6 flex-shrink-0', active ? 'text-primary-500' : '')} />
                
                {isExpanded && (
                  <span className={cn("text-sm font-semibold whitespace-nowrap", active ? 'text-primary-500' : 'text-dark-300')}>
                    {mod.label}
                  </span>
                )}
                
                {!isExpanded && (
                  <div className="absolute left-14 bg-dark-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] hidden lg:block">
                    {mod.label}
                  </div>
                )}
                
                {active && !isExpanded && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-500 rounded-r-full" />
                )}
                {active && isExpanded && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
                )}
              </button>
            )
          })}
        </nav>

        <div className="mt-4 pt-4 border-t border-dark-800 w-full flex justify-center">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 rounded-xl bg-dark-800 text-dark-400 hover:text-white flex items-center justify-center transition-colors"
          >
            {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {activeModule && (
        <>
          <div 
            className="fixed inset-0 z-[40] bg-black/5 lg:bg-transparent transition-opacity"
            onClick={() => setActiveModule(null)}
          />
          
          <div 
            className={cn("fixed top-20 z-[45] animate-fade-in flex flex-col overflow-hidden w-auto max-w-[400px] max-h-[80vh] bg-white rounded-xl border border-dark-200 shadow-2xl", isExpanded ? "left-[256px]" : "left-[84px]")}
          >
          {(() => {
            const mod = modules.find(m => m.id === activeModule)
            if (!mod) return null
            const items = mod.items?.filter(item => item.roles.includes(userRole)) || []

            return (
              <>
                <div className="flex-shrink-0 px-5 py-4 border-b border-dark-100 bg-[#FEF6F7]">
                  <h2 className="font-bold text-lg text-dark-900 flex items-center gap-2">
                    {mod.label}
                  </h2>
                </div>
                <div className="p-4 overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveModule(null)}
                        className="group flex flex-col items-center justify-center gap-2 p-3 bg-white rounded-xl border border-dark-200 hover:border-primary-500 hover:bg-primary-50/50 transition-all text-center h-[90px]"
                      >
                        <div className={cn("p-2 rounded-lg transition-colors", mod.color.replace('text-', 'bg-').replace('500', '100'), mod.color)}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-dark-700 group-hover:text-primary-600 line-clamp-2 leading-tight">
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )
          })()}
          </div>
        </>
      )}
    </div>
  )
}
