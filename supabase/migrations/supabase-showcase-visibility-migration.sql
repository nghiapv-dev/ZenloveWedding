-- Add visibility controls for Slide cưới and Màn sao băng.
-- Run once in Supabase SQL Editor before deploying the matching frontend.

alter table public.showcase_templates
add column if not exists is_visible boolean not null default true;

create index if not exists showcase_templates_visibility_sort_idx
on public.showcase_templates (type, is_visible, sort_order, created_at);

drop policy if exists "public can read showcase templates" on public.showcase_templates;
drop policy if exists "public can read visible showcase templates" on public.showcase_templates;
drop policy if exists "authenticated users can read showcase templates" on public.showcase_templates;
drop policy if exists "authenticated users can update showcase templates" on public.showcase_templates;

create policy "public can read visible showcase templates"
on public.showcase_templates for select to anon
using (is_visible = true);

create policy "authenticated users can read showcase templates"
on public.showcase_templates for select to authenticated
using (true);

create policy "authenticated users can update showcase templates"
on public.showcase_templates for update to authenticated
using (true) with check (true);

notify pgrst, 'reload schema';
