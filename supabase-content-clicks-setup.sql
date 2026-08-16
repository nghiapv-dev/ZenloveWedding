-- Anonymous, aggregate-only click events for the public template showcase.
-- No visitor identity or personal information is stored.

create table if not exists public.content_clicks (
  id bigint generated always as identity primary key,
  category text not null check (category in ('wedding', 'video', 'background')),
  created_at timestamptz not null default now()
);

create index if not exists content_clicks_category_created_at_idx
on public.content_clicks (category, created_at desc);

alter table public.content_clicks enable row level security;

drop policy if exists "public can record content clicks" on public.content_clicks;
drop policy if exists "authenticated users can read content clicks" on public.content_clicks;

create policy "public can record content clicks"
on public.content_clicks for insert
to anon, authenticated
with check (true);

create policy "authenticated users can read content clicks"
on public.content_clicks for select
to authenticated
using (true);

notify pgrst, 'reload schema';
