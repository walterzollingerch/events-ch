import Link from 'next/link'
import CategoryForm from '@/components/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/categories" className="hover:text-gray-900">Kategorien</Link>
        <span>/</span>
        <span className="text-gray-900">Neue Kategorie</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Neue Kategorie</h1>
      <CategoryForm />
    </div>
  )
}
