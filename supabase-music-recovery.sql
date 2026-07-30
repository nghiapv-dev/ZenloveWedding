-- Restore existing music rows for the Zenlove admin account.
-- Run this once in Supabase SQL Editor, then refresh /admin/music.

select id, title, file_name, owner_id, storage_path
from public.music_tracks
order by created_at desc;

update public.music_tracks
set owner_id = 'a8b6c5f2-be85-4544-98c5-9c80cdd4617c'
where owner_id is null;

notify pgrst, 'reload schema';