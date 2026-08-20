-- Restore all existing music entries for the current Zenlove admin.
-- Run ALL of this script in Supabase SQL Editor.

begin;

-- Confirm the real Supabase user id for the admin email.
select id, email
from auth.users
where email = 'nphan6346@gmail.com';

-- All 113 existing tracks belong to this Zenlove admin account.
update public.music_tracks
set owner_id = (select id from auth.users where email = 'nphan6346@gmail.com' limit 1)
where owner_id is distinct from (select id from auth.users where email = 'nphan6346@gmail.com' limit 1);

-- Recreate the table permissions used by /admin/music.
drop policy if exists "authenticated users can manage music tracks" on public.music_tracks;
drop policy if exists "owners can read music tracks" on public.music_tracks;
drop policy if exists "owners can insert music tracks" on public.music_tracks;
drop policy if exists "owners can update music tracks" on public.music_tracks;
drop policy if exists "owners can delete music tracks" on public.music_tracks;

create policy "owners can read music tracks"
on public.music_tracks for select to authenticated
using (auth.uid() = owner_id);

create policy "owners can insert music tracks"
on public.music_tracks for insert to authenticated
with check (auth.uid() = owner_id);

create policy "owners can update music tracks"
on public.music_tracks for update to authenticated
using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "owners can delete music tracks"
on public.music_tracks for delete to authenticated
using (auth.uid() = owner_id);

notify pgrst, 'reload schema';
commit;

-- This must return one row with 113 (or your actual number) after the update.
select owner_id, count(*) as total_tracks
from public.music_tracks
group by owner_id;