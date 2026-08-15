import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ============================================================
// Route-to-Role Access Map
// Mendefinisikan role mana yang boleh mengakses prefix path tertentu
// ============================================================
const ROUTE_PERMISSIONS: { prefix: string; allowed: string[] }[] = [
  // Laporan — hanya super_admin
  { prefix: '/reports', allowed: ['super_admin'] },

  // Pengaturan — hanya super_admin
  { prefix: '/settings', allowed: ['super_admin'] },

  // Arus Kas — hanya super_admin
  { prefix: '/cashflow', allowed: ['super_admin'] },

  // Pembelian & Pemasok — super_admin & admin_gudang
  { prefix: '/purchases', allowed: ['super_admin', 'admin_gudang'] },
  { prefix: '/suppliers', allowed: ['super_admin', 'admin_gudang'] },

  // Persediaan — super_admin, admin_gudang, sales (view inventory)
  { prefix: '/inventory', allowed: ['super_admin', 'admin_gudang', 'sales'] },
  { prefix: '/categories', allowed: ['super_admin', 'admin_gudang'] },
  { prefix: '/units', allowed: ['super_admin', 'admin_gudang'] },

  // Penjualan — super_admin, kasir, sales
  { prefix: '/pos', allowed: ['super_admin', 'kasir', 'sales'] },
  { prefix: '/transactions', allowed: ['super_admin', 'kasir'] },
  { prefix: '/customers', allowed: ['super_admin', 'kasir', 'sales'] },
  { prefix: '/receivables', allowed: ['super_admin', 'kasir'] },
  { prefix: '/shifts', allowed: ['super_admin', 'kasir'] },

  // Kas & Bank — super_admin & kasir
  { prefix: '/expenses', allowed: ['super_admin', 'kasir'] },

  // Dashboard — semua role aktif
  { prefix: '/', allowed: ['super_admin', 'kasir', 'admin_gudang', 'sales'] },
]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 1. Jika tidak login dan bukan di halaman login → redirect ke login
  if (!user && !pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Jika sudah login dan mencoba akses halaman login → redirect ke dashboard
  if (user && pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 3. Jika sudah login, cek role permission per route
  if (user) {
    // Ambil role dari profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    // Jika profil tidak ada atau status inactive → paksa logout
    if (!profile || profile.status === 'inactive') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const userRole = profile.role as string

    // Lewati pengecekan untuk halaman print dan API
    if (pathname.startsWith('/print') || pathname.startsWith('/api')) {
      return supabaseResponse
    }

    // Cari rule yang cocok (prefix terpanjang yang cocok diprioritaskan)
    const matchedRules = ROUTE_PERMISSIONS.filter(r =>
      pathname === r.prefix || pathname.startsWith(r.prefix + '/')
    ).sort((a, b) => b.prefix.length - a.prefix.length)

    if (matchedRules.length > 0) {
      const rule = matchedRules[0]
      if (!rule.allowed.includes(userRole)) {
        // Role tidak punya akses → redirect ke halaman utama
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
