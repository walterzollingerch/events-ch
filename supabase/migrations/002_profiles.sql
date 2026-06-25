create type user_role as enum ('admin', 'content_manager');

create table profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text not null,
  full_name  text,
  role       user_role not null default 'content_manager',
  created_at timestamptz not null default now()
);

-- Auto-Profil bei neuem Auth-User
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Bestehende Auth-User nachziehen
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- RLS
alter table profiles enable row level security;

create policy "authenticated users can read all profiles"
  on profiles for select to authenticated using (true);

create policy "admins can update any profile"
  on profiles for update to authenticated
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Ersten Admin manuell setzen:
-- update profiles set role = 'admin' where email = 'walter.zollinger@tomtalent.ch';
