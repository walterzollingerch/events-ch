import Link from 'next/link'
import EventForm from '@/components/EventForm'
import { getRole } from '@/lib/auth'

export default async function NewEventPage() {
  const role = await getRole()
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-gray-900">Events</Link>
        <span>/</span>
        <span className="text-gray-900">Neues Event</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Neues Event</h1>
      <EventForm role={role} />
    </div>
  )
}
