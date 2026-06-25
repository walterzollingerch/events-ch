'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/lib/auth'

function adminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY nicht gesetzt')
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function updateRole(userId: string, role: UserRole) {
  const callerRole = await getRole()
  if (callerRole !== 'admin') throw new Error('Keine Berechtigung')

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
}

export async function inviteUser(email: string, role: UserRole) {
  const callerRole = await getRole()
  if (callerRole !== 'admin') throw new Error('Keine Berechtigung')

  const admin = adminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email)
  if (error) throw new Error(error.message)

  // Rolle direkt setzen (Trigger setzt default 'content_manager')
  if (role === 'admin') {
    await admin.from('profiles').update({ role }).eq('id', data.user.id)
  }

  revalidatePath('/admin/users')
}

export async function deleteUser(userId: string) {
  const callerRole = await getRole()
  if (callerRole !== 'admin') throw new Error('Keine Berechtigung')

  const admin = adminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/users')
}
