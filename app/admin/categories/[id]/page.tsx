import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CategoryForm from '@/components/CategoryForm'
import type { Category } from '@/lib/types'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const category = data as Category

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/categories" className="hover:text-gray-900">Kategorien</Link>
        <span>/</span>
        <span className="text-gray-900">{category.name}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kategorie bearbeiten</h1>
      <CategoryForm category={category} />
    </div>
  )
}
