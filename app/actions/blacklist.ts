'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteBlacklistEntry(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('url_blacklist').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/blacklist')
}

export async function addBlacklistEntry(formData: FormData) {
  const raw = (formData.get('domain') as string ?? '').trim()
  const reason = (formData.get('reason') as string ?? '').trim() || null

  if (!raw) throw new Error('Domain ist erforderlich')

  const domain = raw
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .toLowerCase()

  const supabase = await createClient()
  const { error } = await supabase.from('url_blacklist').insert({
    domain,
    reason,
    created_by: 'admin',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/blacklist')
}
