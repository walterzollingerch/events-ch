import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Category } from '@/lib/types'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('event_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm">
        Fehler beim Laden: {error.message}
      </div>
    )
  }

  const activeCount = categories?.filter(c => c.active).length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategorien</h1>
          <p className="text-sm text-gray-500 mt-1">
            {categories?.length ?? 0} total · {activeCount} aktiv · n8n stellt pro aktiver Kategorie eine Gemini-Anfrage
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Kategorie erstellen
        </Link>
      </div>

      {categories && categories.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-700 w-8">#</th>
                <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 font-medium text-gray-700">Gemini-Suchbegriff</th>
                <th className="px-4 py-3 font-medium text-gray-700 text-center">Aktiv</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(categories as Category[]).map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{cat.sort_order}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-sm truncate">{cat.gemini_prompt}</td>
                  <td className="px-4 py-3 text-center">
                    {cat.active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        inaktiv
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/categories/${cat.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Bearbeiten
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">Noch keine Kategorien. Migration 003 ausführen und Kategorien erstellen.</p>
        </div>
      )}
    </div>
  )
}
