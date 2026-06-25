'use client'

import { useRouter, usePathname } from 'next/navigation'

type Props = {
  field: string
  label: string
  currentSort: string
  currentOrder: string
}

export default function SortableHeader({ field, label, currentSort, currentOrder }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = currentSort === field
  const nextOrder = isActive && currentOrder === 'asc' ? 'desc' : 'asc'

  function handleClick() {
    router.push(`${pathname}?sort=${field}&order=${nextOrder}`)
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900 group"
    >
      {label}
      <span className={`text-xs transition-colors ${isActive ? 'text-blue-600' : 'text-gray-300 group-hover:text-gray-500'}`}>
        {isActive ? (currentOrder === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </button>
  )
}
