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
  ChevronRight, Scale, Landmark
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
    color: 'text-indigo-500',
    roles: ['super_admin', 'kasir', 'admin_gudang', 'sales'],
    href: '/'
  },
  {
    id: 'penjualan',
    label: 'Penjualan',
    icon: ShoppingCart,
    color: 'text-pink-500',
    roles: ['super_admin', 'kasir', 'sales'],
    items: [
      { href: '/pos', icon: ShoppingCart, label: 'Mesin Kasir (POS)', color: 'text-pink-500', roles: ['super_admin', 'kasir', 'sales'] },
      { href: '/transactions', icon: FileText, label: 'Pesanan & Transaksi', color: 'text-indigo-500', roles: ['super_admin', 'kasir'] },
      { href: '/customers', icon: Users, label: 'Pelanggan', color: 'text-primary-500', roles: ['super_admin', 'kasir', 'sales'] },
      { href: '/receivables', icon: AlertCircle, label: 'Piutang', color: 'text-red-500', roles: ['super_admin', 'kasir'] },
      { href: '/shifts', icon: Clock, label: 'Shift Kasir', color: 'text-orange-500', roles: ['super_admin', 'kasir'] },
    ]
  },
  {
    id: 'pembelian',
    label: 'Pembelian',
    icon: ShoppingBag,
    color: 'text-orange-500',
    roles: ['super_admin', 'admin_gudang'],
    items: [
      { href: '/purchases', icon: ShoppingBag, label: 'Pesanan Pembelian', color: 'text-orange-500', roles: ['super_admin', 'admin_gudang'] },
      { href: '/suppliers', icon: Truck, label: 'Pemasok', color: 'text-cyan-500', roles: ['super_admin', 'admin_gudang'] },
    ]
  },
  {
    id: 'persediaan',
    label: 'Persediaan',
    icon: Package,
    color: 'text-emerald-500',
    roles: ['super_admin', 'admin_gudang', 'sales'],
    items: [
      { href: '/inventory', icon: Package, label: 'Barang & Stok', color: 'text-emerald-500', roles: ['super_admin', 'admin_gudang', 'sales'] },
      { href: '/categories', icon: Tags, label: 'Kategori Barang', color: 'text-fuchsia-500', roles: ['super_admin', 'admin_gudang'] },
      { href: '/units', icon: Scale, label: 'Satuan Barang', color: 'text-sky-500', roles: ['super_admin', 'admin_gudang'] },
    ]
  },
  {
    id: 'keuangan',
    label: 'Kas & Bank',
    icon: Receipt,
    color: 'text-amber-500',
    roles: ['super_admin', 'kasir'],
    items: [
      { href: '/cashflow', icon: Landmark, label: 'Arus Kas (Cashflow)', color: 'text-emerald-500', roles: ['super_admin'] },
      { href: '/expenses', icon: Receipt, label: 'Pengeluaran', color: 'text-amber-500', roles: ['super_admin', 'kasir'] },
    ]
  },
  {
    id: 'laporan',
    label: 'Laporan',
    icon: BarChart3,
    color: 'text-violet-500',
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
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const supabase = createClient()
  const sidebarRef = useRef<HTMLDivElement>(null)

  const allowedModules = modules.filter(m => m.roles.includes(userRole))

  // Close flyout when pressing Escape
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
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 rounded-xl bg-dark-900 text-white flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[40]"
          onClick={() => {
            setMobileOpen(false)
            setActiveModule(null)
          }}
        />
      )}

      {/* MAIN SLIM SIDEBAR (Accurate Style) */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-dark-900 border-r border-dark-800 z-[50] flex flex-col items-center py-4 transition-transform duration-300 w-[72px]',
          !mobileOpen && 'max-lg:-translate-x-full'
        )}
      >
        {/* Logo */}
        <Link href="/" className="w-10 h-10 rounded-xl overflow-hidden relative mb-6 shadow-sm group">
          <Image src="/logo.jpeg" alt="Logo" fill className="object-cover group-hover:scale-110 transition-transform" />
        </Link>

        {/* Icons */}
        <nav className="flex-1 w-full flex flex-col gap-2 px-2 items-center overflow-y-auto no-scrollbar">
          {allowedModules.map((mod) => {
            const Icon = mod.icon
            const active = isModuleActive(mod) || activeModule === mod.id
            return (
              <button
                key={mod.id}
                onClick={() => handleModuleClick(mod)}
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center relative group transition-all',
                  active ? 'bg-primary-500/10 text-primary-500' : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                )}
                title={mod.label}
              >
                <Icon className={cn('w-6 h-6', active ? 'text-primary-500' : '')} />
                
                {/* Tooltip on hover (desktop only) */}
                <div className="absolute left-14 bg-dark-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] hidden lg:block">
                  {mod.label}
                </div>
                
                {/* Indicator dot */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-500 rounded-r-full" />
                )}
              </button>
            )
          })}
        </nav>

      </aside>

      {/* FLYOUT MENU (The Popover Submenu) */}
      {activeModule && (
        <>
          {/* Backdrop (Click to close) */}
          <div 
            className="fixed inset-0 z-[40] bg-black/5 lg:bg-black/10 transition-opacity"
            onClick={() => setActiveModule(null)}
          />
          
          <div 
            className="fixed top-1/2 -translate-y-1/2 left-[84px] w-[340px] max-h-[85vh] bg-white border border-dark-100 rounded-[24px] shadow-[0_0_40px_rgba(0,0,0,0.15)] z-[45] animate-slide-right flex flex-col overflow-hidden"
          >
          {(() => {
            const mod = modules.find(m => m.id === activeModule)
            if (!mod) return null
            const items = mod.items?.filter(item => item.roles.includes(userRole)) || []

            return (
              <>
                <div className="h-16 flex flex-shrink-0 items-center px-6 border-b border-dark-100 bg-[#FEF6F7]">
                  <h2 className="font-bold text-lg text-dark-900 flex items-center gap-2">
                    <mod.icon className={cn("w-5 h-5", mod.color)} />
                    {mod.label}
                  </h2>
                </div>
                <div className="p-5 overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-2 gap-3">
                    {items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          setActiveModule(null)
                          setMobileOpen(false)
                        }}
                        className="group flex flex-col items-center text-center gap-2 p-4 bg-white rounded-xl border border-dark-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
                      >
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", item.color.replace('text-', 'bg-').replace('500', '50'))}>
                          <item.icon className={cn("w-6 h-6", item.color)} />
                        </div>
                        <span className="text-[13px] font-medium text-dark-700 group-hover:text-primary-600 transition-colors">
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
