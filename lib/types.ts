export type EventStatus = 'draft' | 'published' | 'archived'

export interface Category {
  id: number
  name: string
  gemini_prompt: string
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>
export type CategoryUpdate = Partial<CategoryInsert>

export type EventCategory =
  | 'konzert'
  | 'festival'
  | 'theater'
  | 'ausstellung'
  | 'sport'
  | 'messe'
  | 'vortrag'
  | 'party'
  | 'family'
  | 'sonstiges'

export interface EventCategoryLink {
  event_id: string
  category_id: number
  created_at: string
  category?: Category
}

export interface Event {
  id: string
  title: string
  description: string | null
  location: string | null
  address: string | null
  city: string | null
  canton: string | null
  start_date: string
  end_date: string | null
  url: string | null
  image_url: string | null
  category: EventCategory | null
  organizer: string | null
  price: string | null
  status: EventStatus
  needs_enrichment: boolean
  last_enriched_at: string | null
  source: string | null
  gallery_images: string[]
  created_at: string
  updated_at: string
  event_category_links?: EventCategoryLink[]
}

export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at'>
export type EventUpdate = Partial<EventInsert>
