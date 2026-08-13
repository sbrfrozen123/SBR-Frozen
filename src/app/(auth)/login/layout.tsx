import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login — SBR Frozen',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
