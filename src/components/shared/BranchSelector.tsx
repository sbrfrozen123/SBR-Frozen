'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { Check, ChevronDown, Store, Loader2 } from 'lucide-react'
import { setActiveBranch } from '@/app/actions/branch'
import { useRouter } from 'next/navigation'
import type { Branch } from '@/types/database'

interface BranchSelectorProps {
  branches: Branch[]
  activeBranchId: string | null
}

export function BranchSelector({ branches, activeBranchId }: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeBranch = branches.find(b => b.id === activeBranchId)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (id: string | null) => {
    setIsOpen(false)
    startTransition(async () => {
      await setActiveBranch(id)
      router.refresh()
    })
  }

  return (
    <>
      {/* Global loading overlay to prevent interacting with stale data during branch switch */}
      {isPending && (
        <div className="fixed inset-0 z-[9999] bg-white/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-wait animate-in fade-in duration-200">
          <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            <span className="font-semibold text-dark-800">Menyinkronkan Cabang...</span>
          </div>
        </div>
      )}

      <div className="relative z-50" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-dark-200 rounded-xl shadow-sm hover:border-primary-300 hover:bg-primary-50/50 transition-colors text-sm font-medium text-dark-800 disabled:opacity-70 disabled:cursor-wait"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
          ) : (
            <Store className="w-4 h-4 text-primary-500" />
          )}
          <span className="truncate max-w-[120px]">
            {activeBranch ? activeBranch.name : 'Semua Cabang'}
          </span>
          <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-dark-100 rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            <div className="p-1">
              <button
                onClick={() => handleSelect(null)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors ${
                  !activeBranchId ? 'bg-primary-50 text-primary-700 font-bold' : 'text-dark-700 hover:bg-dark-50'
                }`}
              >
                <span>Semua Cabang</span>
                {!activeBranchId && <Check className="w-4 h-4 text-primary-500" />}
              </button>
              <div className="h-px bg-dark-100 my-1 mx-2" />
              {branches.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => handleSelect(branch.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors ${
                    activeBranchId === branch.id ? 'bg-primary-50 text-primary-700 font-bold' : 'text-dark-700 hover:bg-dark-50'
                  }`}
                >
                  <span>{branch.name}</span>
                  {activeBranchId === branch.id && <Check className="w-4 h-4 text-primary-500" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
