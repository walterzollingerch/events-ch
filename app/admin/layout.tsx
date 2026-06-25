import { createClient } from '@/lib/supabase/server'
import { getRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = await getRole()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav userEmail={user.email ?? ''} role={role} />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
