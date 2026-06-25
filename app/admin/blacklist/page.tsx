import { createClient } from '@/lib/supabase/server'
import { deleteBlacklistEntry, addBlacklistEntry } from '@/app/actions/blacklist'
import type { UrlBlacklist } from '@/lib/types'

export default async function AdminBlacklistPage() {
  const supabase = await createClient()

  const { data: entries, error } = await supabase
    .from('url_blacklist')
    .select('*')
    .order('blacklisted_at', { ascending: false })

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm">
        Fehler beim Laden: {error.message}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">URL-Blacklist</h1>
          <p className="text-sm text-gray-500 mt-1">
            {entries?.length ?? 0} Einträge · Ticket-Plattformen und Event-Aggregatoren werden beim Recherchieren übersprungen
          </p>
        </div>
      </div>

      {/* Formular: neuen Eintrag hinzufügen */}
      <form action={addBlacklistEntry} className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Domain oder URL</label>
          <input
            type="text"
            name="domain"
            required
            placeholder="z.B. ticketcorner.ch oder https://www.ticketcorner.ch/event/..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-64">
          <label className="block text-xs font-medium text-gray-700 mb-1">Grund (optional)</label>
          <input
            type="text"
            name="reason"
            placeholder="z.B. Ticket-Plattform"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          + Hinzufügen
        </button>
      </form>

      {/* Tabelle */}
      {entries && entries.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-700">Domain</th>
                <th className="px-4 py-3 font-medium text-gray-700">Grund</th>
                <th className="px-4 py-3 font-medium text-gray-700">Hinzugefügt von</th>
                <th className="px-4 py-3 font-medium text-gray-700">Geblacklistet am</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(entries as UrlBlacklist[]).map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-gray-900">{entry.domain}</td>
                  <td className="px-4 py-3 text-gray-500">{entry.reason ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      entry.created_by === 'n8n-auto'
                        ? 'bg-purple-100 text-purple-800'
                        : entry.created_by === 'system'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {entry.created_by}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(entry.blacklisted_at).toLocaleDateString('de-CH', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteBlacklistEntry.bind(null, entry.id)}>
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Entfernen
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">Keine Einträge. Migration 008 ausführen.</p>
        </div>
      )}
    </div>
  )
}
