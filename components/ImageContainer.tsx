'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  mainImage: string | null
  galleryImages: string[]
  onChange: (mainImage: string | null, galleryImages: string[]) => void
}

export default function ImageContainer({ mainImage, galleryImages, onChange }: Props) {
  const gallery = [...galleryImages, '', '', ''].slice(0, 3)

  function setMain(url: string | null) {
    onChange(url, galleryImages)
  }

  function setGallery(index: number, url: string | null) {
    const next = [...gallery]
    next[index] = url ?? ''
    onChange(mainImage, next.filter(u => u !== '').concat(next.filter(u => u === '')).slice(0, 3))
  }

  return (
    <div className="space-y-3">
      {/* Hauptbild */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Hauptbild</p>
        <ImageSlot
          url={mainImage}
          onUpload={setMain}
          onRemove={() => setMain(null)}
          aspectClass="aspect-video"
        />
      </div>

      {/* Galerie */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Galerie (max. 3)</p>
        <div className="grid grid-cols-3 gap-3">
          {gallery.map((url, i) => (
            <ImageSlot
              key={i}
              url={url || null}
              onUpload={u => setGallery(i, u)}
              onRemove={() => setGallery(i, null)}
              aspectClass="aspect-[4/3]"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type SlotProps = {
  url: string | null
  onUpload: (url: string) => void
  onRemove: () => void
  aspectClass: string
}

function ImageSlot({ url, onUpload, onRemove, aspectClass }: SlotProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()
    const path = `${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(path, file, { upsert: false })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(path)

    onUpload(publicUrl)
    setUploading(false)
    // Reset so gleiche Datei nochmal wählbar
    e.target.value = ''
  }

  return (
    <div className={`relative ${aspectClass} rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          {/* Hover-Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-800 rounded-lg px-2 py-1 text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Ersetzen
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="bg-red-600 text-white rounded-lg px-2 py-1 text-xs font-medium hover:bg-red-700 transition-colors"
            >
              Entfernen
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
          <span className="text-xs">{uploading ? 'Lädt hoch…' : 'Bild hochladen'}</span>
        </button>
      )}

      {error && (
        <div className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-xs px-2 py-1 truncate">
          {error}
        </div>
      )}
    </div>
  )
}
