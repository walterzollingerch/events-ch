'use client'

import { useState, useTransition } from 'react'
import { updateRole, deleteUser } from '@/app/actions/users'
import type { UserRole } from '@/lib/auth'

type Profile = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  content_manager: 'Content Manager',
}

export default function UserTable({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left">
            <th className="px-4 py-3 font-medium text-gray-700">E-Mail</th>
            <th className="px-4 py-3 font-medium text-gray-700">Name</th>
            <th className="px-4 py-3 font-medium text-gray-700">Rolle</th>
            <th className="px-4 py-3 font-medium text-gray-700">Erstellt</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {profiles.map(profile => (
            <UserRow key={profile.id} profile={profile} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UserRow({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleRoleChange(role: UserRole) {
    setError(null)
    startTransition(async () => {
      try {
        await updateRole(profile.id, role)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Fehler')
      }
    })
  }

  function handleDelete() {
    if (!confirm(`${profile.email} wirklich löschen?`)) return
    setError(null)
    startTransition(async () => {
      try {
        await deleteUser(profile.id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Fehler')
      }
    })
  }

  return (
    <tr className={`hover:bg-gray-50 transition-colors ${isPending ? 'opacity-50' : ''}`}>
      <td className="px-4 py-3 text-gray-900">{profile.email}</td>
      <td className="px-4 py-3 text-gray-600">{profile.full_name ?? '—'}</td>
      <td className="px-4 py-3">
        <select
          value={profile.role}
          onChange={e => handleRoleChange(e.target.value as UserRole)}
          disabled={isPending}
          className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </td>
      <td className="px-4 py-3 text-gray-500 text-xs">
        {new Date(profile.created_at).toLocaleDateString('de-CH')}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          Löschen
        </button>
      </td>
    </tr>
  )
}
