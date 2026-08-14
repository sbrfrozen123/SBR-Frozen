'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, Bell, HelpCircle, ChevronDown, LogOut } from 'lucide-react'
import { BranchSelector } from './BranchSelector'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface GlobalHeaderProps {
  userName: string;
  userRole: string;
  branches?: any[];
  activeBranchId?: string;
}

export function GlobalHeader({ userName, userRole, branches, activeBranchId }: GlobalHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="w-full bg-white h-14 flex items-center justify-between shadow-sm border-b border-dark-100 shrink-0 z-40 px-4 relative">
      
      {/* Center Banner Background - Mimicking Enterprise App Promo/Announcement Banners */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Subtle Gradient & Text */}
        <div className="absolute inset-y-0 left-1/4 right-1/4 bg-gradient-to-r from-transparent via-primary-50/50 to-transparent"></div>
        <div className="z-0 flex items-center gap-2 opacity-[0.15]">
           <span className="text-xl font-black italic tracking-widest text-primary-700">SBR FROZEN POS</span>
           <span className="text-xl font-light tracking-widest text-dark-800">ENTERPRISE EDITION</span>
        </div>
      </div>

      {/* Left Area (App Info) */}
      <div className="flex items-center gap-3 z-10">
         <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-dark-100">
            <span className="font-extrabold text-dark-800 text-sm tracking-wide">SBR<span className="text-primary-600">POS</span></span>
            <span className="bg-gradient-primary text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest shadow-sm">
              v1.0
            </span>
         </div>
      </div>

      {/* Right Utility Area */}
      <div className="flex items-center gap-2 sm:gap-4 z-10 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-2xl">
        
        {/* Branch Selector (Only for Super Admin) */}
        {userRole === 'super_admin' && branches && (
          <div className="hidden md:flex items-center gap-2 mr-2 border-r border-dark-200 pr-4">
             <BranchSelector branches={branches} activeBranchId={activeBranchId || ''} />
          </div>
        )}

        {/* Utility Icons */}
        <div className="flex items-center gap-0.5 text-dark-500 mr-1 sm:mr-3 border-r border-dark-200 pr-2 sm:pr-4">
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-dark-50 hover:text-primary-600 transition-colors">
            <Search className="w-[18px] h-[18px]" />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-dark-50 hover:text-primary-600 transition-colors">
            <HelpCircle className="w-[18px] h-[18px]" />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-dark-50 hover:text-primary-600 transition-colors relative">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger rounded-full border border-white"></span>
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 cursor-pointer hover:bg-dark-50 p-1 pr-2 rounded-full transition-colors"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-dark-800 leading-tight">{userName}</span>
              <span className="text-[10px] text-dark-400 font-semibold tracking-wider">
                {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Administrator' : 'Kasir'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shadow-sm text-sm border border-primary-200">
              {userName.charAt(0).toUpperCase()}
            </div>
            <ChevronDown className={cn("w-4 h-4 text-dark-400 hidden sm:block transition-transform", isProfileOpen && "rotate-180")} />
          </div>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-dark-100 rounded-2xl shadow-xl overflow-hidden animate-slide-up">
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 text-danger hover:bg-danger/10 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
