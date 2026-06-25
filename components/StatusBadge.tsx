import type { EventStatus } from '@/lib/types'

const styles: Record<EventStatus, string> = {
  published: 'bg-green-100 text-green-800',
  draft:     'bg-yellow-100 text-yellow-800',
  archived:  'bg-gray-100 text-gray-600',
}

const labels: Record<EventStatus, string> = {
  published: 'Publiziert',
  draft:     'Entwurf',
  archived:  'Archiviert',
}

export default function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
