-- Add visibility controls for wedding templates.
-- Run once in Supabase SQL Editor before deploying the matching frontend.

alter table public.wedding_templates
add column if not exists is_visible boolean not null default true;

create index if not exists wedding_templates_visibility_sort_idx
on public.wedding_templates (is_visible, sort_order, created_at);

drop policy if exists "public can read wedding templates" on public.wedding_templates;
drop policy if exists "public can read visible wedding templates" on public.wedding_templates;
drop policy if exists "authenticated users can read wedding templates" on public.wedding_templates;
drop policy if exists "authenticated users can update wedding templates" on public.wedding_templates;
drop policy if exists "owners can update wedding templates" on public.wedding_templates;

create policy "public can read visible wedding templates"
on public.wedding_templates for select to anon
using (is_visible = true);

create policy "authenticated users can read wedding templates"
on public.wedding_templates for select to authenticated
using (true);

-- The admin account must also be able to hide templates synced from ZenLove,
-- whose owner_id can be null.
create policy "authenticated users can update wedding templates"
on public.wedding_templates for update to authenticated
using (true) with check (true);

notify pgrst, 'reload schema';
