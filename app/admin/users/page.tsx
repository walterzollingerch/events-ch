import { createClient } from '@/lib/supabase/server'
import { getRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserTable from '@/components/UserTable'
import InviteUserForm from '@/components/InviteUserForm'

export default async function UsersPage() {
  const role = await getRole()
  if (role !== 'admin') redirect('/admin')

  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h1>
          <p className="text-sm text-gray-500 mt-1">{profiles?.length ?? 0} Benutzer</p>
        </div>
      </div>

      <div className="space-y-6">
        <UserTable profiles={profiles ?? []} />
        <InviteUserForm />
      </div>
    </div>
  )
}
