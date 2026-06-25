-- Events table for events.ch
create type event_status as enum ('draft', 'published', 'archived');

create type event_category as enum (
  'konzert', 'festival', 'theater', 'ausstellung',
  'sport', 'messe', 'vortrag', 'party', 'family', 'sonstiges'
);

create table events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  location    text,
  address     text,
  city        text,
  canton      text,
  start_date  timestamptz not null,
  end_date    timestamptz,
  url         text,
  image_url   text,
  category    event_category,
  organizer   text,
  price       text,
  status      event_status not null default 'draft',
  source      text,        -- welcher n8n-Workflow hat das Event geliefert
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Automatisches updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_updated_at
  before update on events
  for each row execute procedure set_updated_at();

-- Indizes für häufige Queries
create index on events (status);
create index on events (start_date);
create index on events (city);
create index on events (category);
create index on events (source);

-- Row Level Security
alter table events enable row level security;

-- Nur authentifizierte User dürfen lesen/schreiben (Admin-UI + n8n service_role bypassed)
create policy "authenticated users can read events"
  on events for select
  to authenticated
  using (true);

create policy "authenticated users can insert events"
  on events for insert
  to authenticated
  with check (true);

create policy "authenticated users can update events"
  on events for update
  to authenticated
  using (true);

create policy "authenticated users can delete events"
  on events for delete
  to authenticated
  using (true);
