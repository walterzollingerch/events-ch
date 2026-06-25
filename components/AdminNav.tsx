'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/auth'

export default function AdminNav({ userEmail, role }: { userEmail: string; role: UserRole | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname.startsWith(href) && (href !== '/admin' || pathname === '/admin')
          ? 'text-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-900">Events.ch</span>
          {navLink('/admin', 'Events')}
          {role === 'admin' && navLink('/admin/users', 'Benutzer')}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 capitalize">{role?.replace('_', ' ')}</span>
          <span className="text-xs text-gray-500">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </div>
    </nav>
  )
}
