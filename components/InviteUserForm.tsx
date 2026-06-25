'use client'

import { useState, useTransition } from 'react'
import { inviteUser } from '@/app/actions/users'
import type { UserRole } from '@/lib/auth'

export default function InviteUserForm() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('content_manager')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      try {
        await inviteUser(email, role)
        setSuccess(true)
        setEmail('')
        setRole('content_manager')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Fehler beim Einladen')
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Benutzer einladen</h2>
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@beispiel.ch"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as UserRole)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="content_manager">Content Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Einladen…' : 'Einladen'}
        </button>
      </form>

      {success && (
        <p className="mt-3 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
          Einladungs-E-Mail wurde versendet.
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  )
}
