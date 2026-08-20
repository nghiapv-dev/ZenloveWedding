-- Expose only song names and categories to the public music suggestion tool.
-- Run this once in the Supabase SQL Editor.

drop function if exists public.get_music_suggestions();

create function public.get_music_suggestions()
returns table (id uuid, title text, category text)
language sql
security definer
set search_path = public
as $$
  select id, title, category
  from public.music_tracks
  order by title;
$$;

revoke all on function public.get_music_suggestions() from public;
grant execute on function public.get_music_suggestions() to anon, authenticated;

notify pgrst, 'reload schema';

-- Verification: this must return music rows before refreshing the website.
select * from public.get_music_suggestions() limit 5;
