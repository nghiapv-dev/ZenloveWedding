-- Run once in Supabase SQL Editor for Slide cưới and Màn sao băng admin.
insert into storage.buckets (id, name, public)
values ('wedding-showcase', 'wedding-showcase', true)
on conflict (id) do update set public = true;

create table if not exists public.showcase_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  type text not null check (type in ('background', 'slide')),
  title text not null,
  url text not null,
  image_path text not null unique,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.showcase_templates enable row level security;
drop policy if exists "public can read showcase templates" on public.showcase_templates;
drop policy if exists "owners can insert showcase templates" on public.showcase_templates;
drop policy if exists "owners can delete showcase templates" on public.showcase_templates;
create policy "public can read showcase templates" on public.showcase_templates for select using (true);
create policy "owners can insert showcase templates" on public.showcase_templates for insert to authenticated with check (auth.uid() = owner_id);
create policy "owners can delete showcase templates" on public.showcase_templates for delete to authenticated using (auth.uid() = owner_id);
drop policy if exists "public can view showcase images" on storage.objects;
drop policy if exists "owners can upload showcase images" on storage.objects;
drop policy if exists "owners can delete showcase images" on storage.objects;
create policy "public can view showcase images" on storage.objects for select using (bucket_id = 'wedding-showcase');
create policy "owners can upload showcase images" on storage.objects for insert to authenticated with check (bucket_id = 'wedding-showcase' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owners can delete showcase images" on storage.objects for delete to authenticated using (bucket_id = 'wedding-showcase' and (storage.foldername(name))[1] = auth.uid()::text);
notify pgrst, 'reload schema';