'use client'

import { useState } from 'react'
import { Store, Users, Info } from 'lucide-react'
import { StoreSettingsForm } from '@/components/settings/StoreSettingsForm'
import { UserManagementTable } from '@/components/settings/UserManagementTable'
import { BranchManagementTable } from '@/components/settings/BranchManagementTable'
import { cn } from '@/lib/utils/cn'

interface SettingsClientProps {
  initialStoreSettings: any
  initialUsers: any[]
  initialBranches: any[]
}

type Tab = 'store' | 'users' | 'branches'

export default function SettingsClient({ initialStoreSettings, initialUsers, initialBranches }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('store')

  return (
    <div className="p-6 h-full flex flex-col space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title">Pengaturan Sistem</h1>
          <p className="page-subtitle">Kelola profil toko dan hak akses karyawan Anda.</p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-dark-100 p-2 shadow-sm sticky top-6">
            <nav className="flex flex-col space-y-1">
              <button
                onClick={() => setActiveTab('store')}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                  activeTab === 'store' 
                    ? 'bg-dark-900 text-white shadow-md' 
                    : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                )}
              >
                <Store className={cn('w-5 h-5', activeTab === 'store' ? 'text-primary-400' : 'text-dark-400')} />
                Profil Toko
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                  activeTab === 'users' 
                    ? 'bg-dark-900 text-white shadow-md' 
                    : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                )}
              >
                <Users className={cn('w-5 h-5', activeTab === 'users' ? 'text-primary-400' : 'text-dark-400')} />
                Manajemen Akses
              </button>

              <button
                onClick={() => setActiveTab('branches')}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                  activeTab === 'branches' 
                    ? 'bg-dark-900 text-white shadow-md' 
                    : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                )}
              >
                <Store className={cn('w-5 h-5', activeTab === 'branches' ? 'text-primary-400' : 'text-dark-400')} />
                Cabang Toko
              </button>
            </nav>
            
            <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
              <div className="flex items-start gap-2 text-primary-700">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs leading-relaxed">
                  Perubahan pengaturan profil toko akan langsung berdampak pada cetakan struk penjualan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'store' && (
            <StoreSettingsForm initialData={initialStoreSettings} />
          )}
          {activeTab === 'users' && (
            <UserManagementTable initialUsers={initialUsers} initialBranches={initialBranches} />
          )}
          {activeTab === 'branches' && (
            <BranchManagementTable initialBranches={initialBranches} />
          )}
        </div>
      </div>
    </div>
  )
}
