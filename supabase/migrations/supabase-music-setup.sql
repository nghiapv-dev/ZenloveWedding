-- Run this in Supabase SQL Editor once.
-- Safe to run multiple times.

-- 1) Create private bucket for wedding music files.
insert into storage.buckets (id, name, public)
values ('wedding-music', 'wedding-music', false)
on conflict (id) do nothing;

-- 2) Store music metadata.
create table if not exists public.music_tracks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  title text not null,
  category text not null,
  file_name text not null,
  storage_path text not null unique,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

alter table public.music_tracks add column if not exists owner_id uuid default auth.uid();

alter table public.music_tracks enable row level security;

-- 3) Only the signed-in owner can manage their metadata.
drop policy if exists "authenticated users can manage music tracks" on public.music_tracks;
drop policy if exists "owners can read music tracks" on public.music_tracks;
drop policy if exists "owners can insert music tracks" on public.music_tracks;
drop policy if exists "owners can update music tracks" on public.music_tracks;
drop policy if exists "owners can delete music tracks" on public.music_tracks;

create policy "owners can read music tracks"
on public.music_tracks
for select
to authenticated
using (auth.uid() = owner_id);

create policy "owners can insert music tracks"
on public.music_tracks
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "owners can update music tracks"
on public.music_tracks
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "owners can delete music tracks"
on public.music_tracks
for delete
to authenticated
using (auth.uid() = owner_id);

-- 4) Only logged-in users can manage files in the wedding-music bucket.
-- The app stores files under: {user_id}/{file-name}
drop policy if exists "authenticated users can read wedding music" on storage.objects;
drop policy if exists "authenticated users can upload wedding music" on storage.objects;
drop policy if exists "authenticated users can update wedding music" on storage.objects;
drop policy if exists "authenticated users can delete wedding music" on storage.objects;
drop policy if exists "owners can read wedding music" on storage.objects;
drop policy if exists "owners can upload wedding music" on storage.objects;
drop policy if exists "owners can update wedding music" on storage.objects;
drop policy if exists "owners can delete wedding music" on storage.objects;

create policy "owners can read wedding music"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'wedding-music'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "owners can upload wedding music"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'wedding-music'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "owners can update wedding music"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'wedding-music'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'wedding-music'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "owners can delete wedding music"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'wedding-music'
  and (storage.foldername(name))[1] = auth.uid()::text
);

