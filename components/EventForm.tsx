'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Event, EventStatus, EventCategory } from '@/lib/types'

const CATEGORIES: EventCategory[] = [
  'konzert', 'festival', 'theater', 'ausstellung',
  'sport', 'messe', 'vortrag', 'party', 'family', 'sonstiges',
]

type Props = {
  event?: Event
  role?: string | null
}

function toDatetimeLocal(iso: string | null | undefined) {
  if (!iso) return ''
  return iso.slice(0, 16)
}

export default function EventForm({ event, role }: Props) {
  const isAdmin = role === 'admin'
  const router = useRouter()
  const supabase = createClient()
  const isNew = !event

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title:       event?.title ?? '',
    description: event?.description ?? '',
    location:    event?.location ?? '',
    address:     event?.address ?? '',
    city:        event?.city ?? '',
    canton:      event?.canton ?? '',
    start_date:  toDatetimeLocal(event?.start_date),
    end_date:    toDatetimeLocal(event?.end_date),
    url:         event?.url ?? '',
    image_url:   event?.image_url ?? '',
    category:    event?.category ?? '',
    organizer:   event?.organizer ?? '',
    price:       event?.price ?? '',
    status:      event?.status ?? 'draft',
    source:      event?.source ?? '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      title:       form.title,
      description: form.description || null,
      location:    form.location || null,
      address:     form.address || null,
      city:        form.city || null,
      canton:      form.canton || null,
      start_date:  form.start_date,
      end_date:    form.end_date || null,
      url:         form.url || null,
      image_url:   form.image_url || null,
      category:    (form.category as EventCategory) || null,
      organizer:   form.organizer || null,
      price:       form.price || null,
      status:      form.status as EventStatus,
      source:      form.source || null,
    }

    if (isNew) {
      const { error } = await supabase.from('events').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('events').update(payload).eq('id', event.id)
      if (error) { setError(error.message); setSaving(false); return }
    }

    router.push('/admin')
    router.refresh()
  }

  async function handleDelete() {
    if (!event || !confirm('Event wirklich löschen?')) return
    setDeleting(true)
    await supabase.from('events').delete().eq('id', event.id)
    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>
      )}

      {/* Basis */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Basis-Informationen</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
          <input
            required
            value={form.title}
            onChange={e => set('title', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beginn *</label>
            <input
              type="datetime-local"
              required
              value={form.start_date}
              onChange={e => set('start_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ende</label>
            <input
              type="datetime-local"
              value={form.end_date}
              onChange={e => set('end_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Ort */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Ort</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Veranstaltungsort</label>
            <input
              value={form.location}
              onChange={e => set('location', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. Hallenstadion"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              value={form.address}
              onChange={e => set('address', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
            <input
              value={form.city}
              onChange={e => set('city', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kanton</label>
            <input
              value={form.canton}
              onChange={e => set('canton', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ZH, BE, GE …"
            />
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— keine —</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preis</label>
            <input
              value={form.price}
              onChange={e => set('price', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CHF 25 / kostenlos"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Veranstalter</label>
          <input
            value={form.organizer}
            onChange={e => set('organizer', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL (Quelle/Ticketing)</label>
          <input
            type="url"
            value={form.url}
            onChange={e => set('url', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bild-URL</label>
          <input
            type="url"
            value={form.image_url}
            onChange={e => set('image_url', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* Meta */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Verwaltung</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Entwurf</option>
              <option value="published">Publiziert</option>
              <option value="archived">Archiviert</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quelle (n8n)</label>
            <input
              value={form.source}
              onChange={e => set('source', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. ch.events scraper"
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Abbrechen
        </button>
        <div className="flex items-center gap-3">
          {!isNew && isAdmin && (
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
