import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TabItem {
  id: string
  href: string
  label: string
}

interface TabState {
  tabs: TabItem[]
  addTab: (tab: TabItem) => void
  removeTab: (href: string) => void
  closeAllExcept: (href: string) => void
}

export const useTabStore = create<TabState>()(
  persist(
    (set) => ({
      tabs: [{ id: 'dashboard', href: '/', label: 'Dashboard' }], // Default pinned tab
      
      addTab: (newTab) => set((state) => {
        // Check if tab already exists by href
        const exists = state.tabs.some((t) => t.href === newTab.href)
        if (exists) return state
        
        return { tabs: [...state.tabs, newTab] }
      }),
      
      removeTab: (href) => set((state) => {
        // Prevent removing the Dashboard (home) tab
        if (href === '/') return state
        return { tabs: state.tabs.filter((t) => t.href !== href) }
      }),

      closeAllExcept: (href) => set((state) => {
        const keptTab = state.tabs.find((t) => t.href === href)
        const dashboardTab = state.tabs.find((t) => t.href === '/') || { id: 'dashboard', href: '/', label: 'Dashboard' }
        
        if (href === '/') {
          return { tabs: [dashboardTab] }
        }
        
        return { 
          tabs: keptTab ? [dashboardTab, keptTab] : [dashboardTab] 
        }
      }),
    }),
    {
      name: 'pos-tab-storage', // name of the item in the storage (must be unique)
    }
  )
)
