import { createClient } from '@/lib/supabase/server'
import { getRole } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EventForm from '@/components/EventForm'
import type { Event } from '@/lib/types'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [supabase, role] = await Promise.all([createClient(), getRole()])

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const event = data as Event

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-gray-900">Events</Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-xs">{event.title}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Event bearbeiten</h1>
      <EventForm event={event} role={role} />
    </div>
  )
}
