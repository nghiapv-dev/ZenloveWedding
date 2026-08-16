-- Run once in Supabase SQL Editor to enable the wedding template admin.

insert into storage.buckets (id, name, public)
values ('wedding-templates', 'wedding-templates', true)
on conflict (id) do update set public = true;

create table if not exists public.wedding_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  title text not null,
  url text not null,
  image_path text unique,
  image_url text not null,
  sort_order integer not null default 0,
  zenlove_id text unique,
  slug text,
  thumbnail_key text,
  long_thumbnail_key text,
  template_type text,
  category_id text,
  source text not null default 'manual' check (source in ('manual', 'zenlove')),
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Makes this script safe to run for the original schema as well.
alter table public.wedding_templates alter column owner_id drop not null;
alter table public.wedding_templates alter column image_path drop not null;
alter table public.wedding_templates add column if not exists zenlove_id text;
alter table public.wedding_templates add column if not exists slug text;
alter table public.wedding_templates add column if not exists thumbnail_key text;
alter table public.wedding_templates add column if not exists long_thumbnail_key text;
alter table public.wedding_templates add column if not exists template_type text;
alter table public.wedding_templates add column if not exists category_id text;
alter table public.wedding_templates add column if not exists source text not null default 'manual';
alter table public.wedding_templates add column if not exists synced_at timestamptz;
alter table public.wedding_templates add column if not exists updated_at timestamptz not null default now();
create unique index if not exists wedding_templates_zenlove_id_key
on public.wedding_templates (zenlove_id)
where zenlove_id is not null;

alter table public.wedding_templates enable row level security;

drop policy if exists "public can read wedding templates" on public.wedding_templates;
drop policy if exists "owners can insert wedding templates" on public.wedding_templates;
drop policy if exists "owners can update wedding templates" on public.wedding_templates;
drop policy if exists "owners can delete wedding templates" on public.wedding_templates;

create policy "public can read wedding templates"
on public.wedding_templates for select using (true);

create policy "owners can insert wedding templates"
on public.wedding_templates for insert to authenticated
with check (auth.uid() = owner_id);

create policy "owners can update wedding templates"
on public.wedding_templates for update to authenticated
using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "owners can delete wedding templates"
on public.wedding_templates for delete to authenticated
using (auth.uid() = owner_id);

drop policy if exists "public can view wedding template images" on storage.objects;
drop policy if exists "owners can upload wedding template images" on storage.objects;
drop policy if exists "owners can update wedding template images" on storage.objects;
drop policy if exists "owners can delete wedding template images" on storage.objects;

create policy "public can view wedding template images"
on storage.objects for select using (bucket_id = 'wedding-templates');

create policy "owners can upload wedding template images"
on storage.objects for insert to authenticated
with check (bucket_id = 'wedding-templates' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners can update wedding template images"
on storage.objects for update to authenticated
using (bucket_id = 'wedding-templates' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'wedding-templates' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners can delete wedding template images"
on storage.objects for delete to authenticated
using (bucket_id = 'wedding-templates' and (storage.foldername(name))[1] = auth.uid()::text);

notify pgrst, 'reload schema';
