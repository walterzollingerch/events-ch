'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category, CategoryInsert } from '@/lib/types'

type Props = {
  category?: Category
}

export default function CategoryForm({ category }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isNew = !category

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name:          category?.name ?? '',
    gemini_prompt: category?.gemini_prompt ?? '',
    active:        category?.active ?? true,
    sort_order:    category?.sort_order ?? 0,
  })

  function set(field: string, value: string | boolean | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload: CategoryInsert = {
      name:          form.name,
      gemini_prompt: form.gemini_prompt,
      active:        form.active,
      sort_order:    Number(form.sort_order),
    }

    if (isNew) {
      const { error } = await supabase.from('event_categories').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('event_categories').update(payload).eq('id', category.id)
      if (error) { setError(error.message); setSaving(false); return }
    }

    router.push('/admin/categories')
    router.refresh()
  }

  async function handleDelete() {
    if (!category || !confirm('Kategorie wirklich löschen? Alle verknüpften Events verlieren die Kategoriezuweisung.')) return
    setDeleting(true)
    const { error } = await supabase.from('event_categories').delete().eq('id', category.id)
    if (error) { setError(error.message); setDeleting(false); return }
    router.push('/admin/categories')
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>
      )}

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Kategorie</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. Konzerte & Entertainment"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gemini-Suchbegriff *
          </label>
          <textarea
            required
            rows={3}
            value={form.gemini_prompt}
            onChange={e => set('gemini_prompt', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. Konzerte, Musik-Festivals und Entertainment-Veranstaltungen"
          />
          <p className="mt-1 text-xs text-gray-400">
            Dieser Text wird in den Gemini-Prompt eingesetzt. Konkrete Begriffe liefern bessere Ergebnisse.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reihenfolge</label>
            <input
              type="number"
              min={0}
              value={form.sort_order}
              onChange={e => set('sort_order', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">Niedrigere Zahl = früher im Workflow</p>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              id="active"
              type="checkbox"
              checked={form.active}
              onChange={e => set('active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Aktiv (wird vom n8n-Workflow abgefragt)
            </label>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/categories')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Abbrechen
        </button>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              {deleting ? 'Löschen…' : 'Löschen'}
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </div>
    </form>
  )
}
