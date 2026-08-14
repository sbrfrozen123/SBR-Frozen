'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTabStore } from '@/store/useTabStore'
import { modules } from './Sidebar'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// Flatten modules to get a map of href -> label
const getTitleFromPath = (path: string): string => {
  if (path === '/') return 'Dashboard'
  if (path === '/settings') return 'Pengaturan'
  if (path.startsWith('/reports/')) {
    if (path.includes('sales')) return 'Lap. Penjualan'
    if (path.includes('profit-loss')) return 'Laba Rugi'
    if (path.includes('inventory')) return 'Lap. Inventaris'
    if (path.includes('expenses-report')) return 'Lap. Pengeluaran'
    return 'Laporan'
  }
  
  // Search in modules
  for (const group of modules) {
    if (group.href === path) return group.label
    if (group.items) {
      for (const item of group.items) {
        if (item.href === path) return item.label
        if (path.startsWith(item.href + '/')) return item.label + ' Detail'
      }
    }
  }
  
  return 'SBR Frozen'
}

export function TopTabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { tabs, addTab, removeTab } = useTabStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Automatically add tab when route changes
  useEffect(() => {
    // Avoid adding login or print routes to tabs
    if (pathname.includes('/login') || pathname.includes('/print/')) return

    addTab({
      id: pathname,
      href: pathname,
      label: getTitleFromPath(pathname)
    })
  }, [pathname, addTab])

  // Scroll to active tab
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]') as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [pathname, tabs.length])

  const handleClose = (e: React.MouseEvent, href: string) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Find index of closed tab
    const index = tabs.findIndex(t => t.href === href)
    removeTab(href)

    // If we closed the active tab, navigate to another tab
    if (pathname === href) {
      const nextTabs = tabs.filter(t => t.href !== href)
      if (nextTabs.length > 0) {
        // Try to go to the previous tab, or the next one if it was the first
        const nextTarget = nextTabs[index - 1] || nextTabs[0]
        router.push(nextTarget.href)
      } else {
        router.push('/')
      }
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full bg-slate-200 border-b border-dark-200 flex items-center shrink-0">
      <button 
        onClick={scrollLeft}
        className="w-8 h-8 flex items-center justify-center text-dark-500 hover:text-dark-900 bg-slate-200 shrink-0 z-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div 
        ref={scrollContainerRef}
        className="flex-1 flex items-end overflow-x-auto no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex px-1 pt-2 gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <div
                key={tab.href}
                data-active={isActive}
                onClick={() => router.push(tab.href)}
                className={cn(
                  'group flex items-center h-8 px-4 min-w-[140px] max-w-[200px] rounded-t-lg border-t border-x border-b border-b-transparent cursor-pointer transition-all shrink-0',
                  isActive 
                    ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                    : 'bg-white border-dark-200 text-dark-600 hover:bg-dark-50'
                )}
              >
                <span className="text-xs font-semibold truncate flex-1 select-none">
                  {tab.label}
                </span>
                
                {tab.href !== '/' && (
                  <button
                    onClick={(e) => handleClose(e, tab.href)}
                    className={cn(
                      'ml-2 w-4 h-4 rounded-md flex items-center justify-center transition-colors',
                      isActive 
                        ? 'text-white/80 hover:bg-white/20 hover:text-white' 
                        : 'text-dark-400 hover:bg-dark-200 hover:text-dark-900'
                    )}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <button 
        onClick={scrollRight}
        className="w-8 h-8 flex items-center justify-center text-dark-500 hover:text-dark-900 bg-slate-200 shrink-0 z-10"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
