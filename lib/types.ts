export type EventStatus = 'draft' | 'published' | 'archived'

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
  source: string | null
  gallery_images: string[]
  created_at: string
  updated_at: string
}

export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at'>
export type EventUpdate = Partial<EventInsert>
