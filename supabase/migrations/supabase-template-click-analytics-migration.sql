-- Run after supabase-content-clicks-setup.sql to track individual templates.

alter table public.content_clicks
add column if not exists template_key text,
add column if not exists template_name text;

create index if not exists content_clicks_template_created_at_idx
on public.content_clicks (template_key, created_at desc);

notify pgrst, 'reload schema';
