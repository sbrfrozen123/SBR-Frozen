'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, BarChart3, ShoppingCart, Package, TrendingUp } from 'lucide-react'

const features = [
  { icon: ShoppingCart, label: 'POS Kasir Real-time', color: 'text-pink-400' },
  { icon: Package, label: 'Manajemen Stok Otomatis', color: 'text-indigo-400' },
  { icon: TrendingUp, label: 'Laporan Laba Rugi Instan', color: 'text-emerald-400' },
  { icon: BarChart3, label: 'Dashboard Eksekutif Live', color: 'text-amber-400' },
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email atau password salah. Coba lagi.')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/5 rounded-full blur-2xl" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl overflow-hidden relative">
              <Image src="/logo.jpeg" alt="SBR Frozen Logo" fill className="object-cover" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">SBR Frozen</div>
              <div className="text-dark-400 text-xs">Business Management System</div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Kelola Bisnis Anda<br />
            <span className="gradient-text">Lebih Cerdas</span>
          </h1>
          <p className="text-dark-400 text-lg leading-relaxed mb-12">
            Platform POS & Business Intelligence terintegrasi untuk retail dan grosir. Semua data, laporan, dan kendali bisnis dalam satu sistem.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-dark-300 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-8">
          {[
            { value: '100%', label: 'Data Aman' },
            { value: 'Real-time', label: 'Update Data' },
            { value: '24/7', label: 'Akses Online' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-dark-500 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl overflow-hidden relative">
              <Image src="/logo.jpeg" alt="SBR Frozen Logo" fill className="object-cover" />
            </div>
            <div>
              <div className="text-dark-900 font-bold text-xl">SBR Frozen</div>
              <div className="text-dark-400 text-xs">Business Management System</div>
            </div>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-dark-900">Masuk Akun</h2>
            <p className="text-dark-400 mt-2">Selamat datang kembali! Silakan masuk untuk melanjutkan.</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-danger-light border border-danger/20 rounded-xl text-danger-dark text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="form-group">
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="nama@perusahaan.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <button type="button" className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors">
                  Lupa Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-lg btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <div className="text-center mt-auto pt-8">
            <p className="text-dark-400 text-xs">
              © 2026 SBR Frozen. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
