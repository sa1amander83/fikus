-- =====================================================================
-- Реестр селекционеров и сортов комнатных растений — схема MVP
-- Выполните этот файл в Supabase SQL Editor.
-- =====================================================================

-- Расширения
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles — селекционер (расширяет auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default 'Селекционер',
  city        text,
  bio         text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- plant_varieties — сорт
-- ---------------------------------------------------------------------
create table if not exists public.plant_varieties (
  id              uuid primary key default gen_random_uuid (),
  name            text not null,
  species         text not null,                 -- вид растения (гибискус, фиалка, ...)
  breeder_id      uuid not null references public.profiles (id) on delete cascade,
  year_created    int,
  description     text,
  care_notes      text,                          -- особенности выращивания
  main_photo_url  text,
  parent_a_id     uuid references public.plant_varieties (id) on delete set null,
  parent_b_id     uuid references public.plant_varieties (id) on delete set null,
  -- Паспорт сорта — характеристики цветка
  origin          text,
  pod_parent      text,
  pollen_parent   text,
  bloom_type      text,
  size_range      text,
  hybridizer      text,
  date_registered text,
  grower          text,
  reg_mini        text,
  color_group     text,
  propagation     text,
  bloom_colors    text,
  created_at      timestamptz not null default now()
);

-- Миграция уже существующих баз: добавляем недостающие колонки паспорта.
alter table public.plant_varieties add column if not exists origin          text;
alter table public.plant_varieties add column if not exists pod_parent      text;
alter table public.plant_varieties add column if not exists pollen_parent   text;
alter table public.plant_varieties add column if not exists bloom_type      text;
alter table public.plant_varieties add column if not exists size_range      text;
alter table public.plant_varieties add column if not exists hybridizer      text;
alter table public.plant_varieties add column if not exists date_registered text;
alter table public.plant_varieties add column if not exists grower          text;
alter table public.plant_varieties add column if not exists reg_mini        text;
alter table public.plant_varieties add column if not exists color_group     text;
alter table public.plant_varieties add column if not exists propagation     text;
alter table public.plant_varieties add column if not exists bloom_colors    text;

create index if not exists idx_varieties_breeder on public.plant_varieties (breeder_id);
create index if not exists idx_varieties_species on public.plant_varieties (species);
create index if not exists idx_varieties_year    on public.plant_varieties (year_created);

-- ---------------------------------------------------------------------
-- plant_photos — галерея сорта
-- ---------------------------------------------------------------------
create table if not exists public.plant_photos (
  id          uuid primary key default gen_random_uuid (),
  variety_id  uuid not null references public.plant_varieties (id) on delete cascade,
  photo_url   text not null,
  caption     text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_photos_variety on public.plant_photos (variety_id);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles        enable row level security;
alter table public.plant_varieties enable row level security;
alter table public.plant_photos    enable row level security;

-- profiles: читать может любой, менять — только владелец
drop policy if exists "profiles_read"   on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;

create policy "profiles_read"   on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid () = id);
create policy "profiles_update" on public.profiles for update using (auth.uid () = id);

-- plant_varieties: читать может любой, менять — только селекционер-владелец
drop policy if exists "varieties_read"   on public.plant_varieties;
drop policy if exists "varieties_insert" on public.plant_varieties;
drop policy if exists "varieties_update" on public.plant_varieties;
drop policy if exists "varieties_delete" on public.plant_varieties;

create policy "varieties_read"   on public.plant_varieties for select using (true);
create policy "varieties_insert" on public.plant_varieties for insert with check (auth.uid () = breeder_id);
create policy "varieties_update" on public.plant_varieties for update using (auth.uid () = breeder_id);
create policy "varieties_delete" on public.plant_varieties for delete using (auth.uid () = breeder_id);

-- plant_photos: читать может любой, менять — владелец родительского сорта
drop policy if exists "photos_read"   on public.plant_photos;
drop policy if exists "photos_insert" on public.plant_photos;
drop policy if exists "photos_delete" on public.plant_photos;

create policy "photos_read" on public.plant_photos for select using (true);
create policy "photos_insert" on public.plant_photos for insert with check (
  exists (
    select 1 from public.plant_varieties v
    where v.id = variety_id and v.breeder_id = auth.uid ()
  )
);
create policy "photos_delete" on public.plant_photos for delete using (
  exists (
    select 1 from public.plant_varieties v
    where v.id = variety_id and v.breeder_id = auth.uid ()
  )
);

-- =====================================================================
-- Автосоздание профиля при регистрации пользователя
-- =====================================================================
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'Селекционер'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user ();

-- =====================================================================
-- Storage: bucket для фотографий растений
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('plant-photos', 'plant-photos', true)
on conflict (id) do nothing;

drop policy if exists "plant_photos_public_read" on storage.objects;
drop policy if exists "plant_photos_auth_write"  on storage.objects;

create policy "plant_photos_public_read" on storage.objects
  for select using (bucket_id = 'plant-photos');

create policy "plant_photos_auth_write" on storage.objects
  for insert with check (bucket_id = 'plant-photos' and auth.role () = 'authenticated');
