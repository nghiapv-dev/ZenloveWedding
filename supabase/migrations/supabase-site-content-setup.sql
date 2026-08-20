-- Mini CMS for editable public website content.
create table if not exists public.site_content (
  id text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table public.site_content enable row level security;

drop policy if exists "public can read site content" on public.site_content;
drop policy if exists "authenticated users can manage site content" on public.site_content;

create policy "public can read site content"
on public.site_content for select using (true);

create policy "authenticated users can manage site content"
on public.site_content for all to authenticated
using (true) with check (true);

insert into public.site_content (id, value)
values ('website', '{}'::jsonb)
on conflict (id) do nothing;

notify pgrst, 'reload schema';
