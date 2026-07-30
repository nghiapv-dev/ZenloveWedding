-- Run once in Supabase SQL Editor to enable the wedding template admin.

insert into storage.buckets (id, name, public)
values ('wedding-templates', 'wedding-templates', true)
on conflict (id) do update set public = true;

create table if not exists public.wedding_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  title text not null,
  url text not null,
  image_path text not null unique,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

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
