-- Galerie-Bilder (max. 3) als Array
alter table events add column if not exists gallery_images text[] not null default '{}';

-- Storage-Bucket für Event-Bilder
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- Storage RLS
create policy "Public can read event images"
  on storage.objects for select
  to public
  using (bucket_id = 'event-images');

create policy "Authenticated users can upload event images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'event-images');

create policy "Authenticated users can delete event images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'event-images');
