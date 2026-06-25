import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import { publishEvent } from '@/app/actions/events'
import type { Event } from '@/lib/types'

export default async function AdminEventsPage() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('events')
    .select('*, event_category_links(category_id, category:event_categories(id, name))')
    .order('start_date', { ascending: false })

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm">
        Fehler beim Laden: {error.message}
      </div>
    )
  }

  const counts = {
    total: events?.length ?? 0,
    published: events?.filter(e => e.status === 'published').length ?? 0,
    draft: events?.filter(e => e.status === 'draft').length ?? 0,
    needsEnrichment: events?.filter(e => e.needs_enrichment).length ?? 0,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-1">
            {counts.total} total · {counts.published} publiziert · {counts.draft} Entwürfe
            {counts.needsEnrichment > 0 && (
              <span className="text-orange-600"> · {counts.needsEnrichment} anreichern</span>
            )}
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Event erstellen
        </Link>
      </div>

      {/* Table */}
      {events && events.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-700">Titel</th>
                <th className="px-4 py-3 font-medium text-gray-700">Ort</th>
                <th className="px-4 py-3 font-medium text-gray-700">Datum</th>
                <th className="px-4 py-3 font-medium text-gray-700">Kategorie</th>
                <th className="px-4 py-3 font-medium text-gray-700">Quelle</th>
                <th className="px-4 py-3 font-medium text-gray-700">Angereichert</th>
                <th className="px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(events as Event[]).map(event => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {event.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {event.city ?? event.location ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(event.start_date).toLocaleDateString('de-CH', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {event.event_category_links?.length
                      ? event.event_category_links.map(l => l.category?.name).filter(Boolean).join(', ')
                      : (event.category ?? '—')}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {event.source ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {event.last_enriched_at
                      ? new Date(event.last_enriched_at).toLocaleDateString('de-CH', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={event.status} />
                      {event.needs_enrichment && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                          Anreichern
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {!event.needs_enrichment && event.status === 'draft' && (
                        <form action={publishEvent.bind(null, event.id)}>
                          <button
                            type="submit"
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Aktivieren
                          </button>
                        </form>
                      )}
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Bearbeiten
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">Noch keine Events. n8n-Workflow starten oder Event manuell erstellen.</p>
        </div>
      )}
    </div>
  )
}
