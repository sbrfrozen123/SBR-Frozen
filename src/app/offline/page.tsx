'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8">
      <div className="text-center max-w-sm">
        {/* Logo */}
        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 shadow-xl border-4 border-slate-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.jpg" alt="SBR Frozen" className="w-full h-full object-cover" />
        </div>
        
        <h1 className="text-2xl font-black mb-2">Tidak Ada Koneksi</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Aplikasi SBR Frozen POS membutuhkan koneksi internet. Silakan periksa koneksi WiFi atau data kamu, lalu coba lagi.
        </p>
        
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-colors w-full"
        >
          Coba Lagi
        </button>
        
        <p className="mt-6 text-xs text-slate-600">SBR Frozen POS v1.0</p>
      </div>
    </div>
  )
}
