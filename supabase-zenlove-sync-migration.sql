-- Run this once if the ZenLove sync reports:
-- "there is no unique or exclusion constraint matching the ON CONFLICT specification"
--
-- PostgreSQL unique indexes allow multiple NULL values, so manual templates
-- without a zenlove_id remain valid while ZenLove rows can be upserted.

drop index if exists public.wedding_templates_zenlove_id_key;

create unique index wedding_templates_zenlove_id_key
on public.wedding_templates (zenlove_id);

notify pgrst, 'reload schema';
