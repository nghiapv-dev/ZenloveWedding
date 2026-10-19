-- Run once in Supabase SQL Editor to curate wedding templates on the homepage.
-- Selections reference existing wedding_templates rows, so ZenLove syncs do not
-- replace the selected list.

create table if not exists public.featured_wedding_templates (
  template_id uuid primary key references public.wedding_templates (id) on delete cascade,
  sort_order smallint not null unique check (sort_order between 1 and 5)
);

alter table public.featured_wedding_templates enable row level security;

drop policy if exists "public can read featured wedding templates" on public.featured_wedding_templates;
drop policy if exists "authenticated users can manage featured wedding templates" on public.featured_wedding_templates;

create policy "public can read featured wedding templates"
on public.featured_wedding_templates for select to anon, authenticated
using (true);

create policy "authenticated users can manage featured wedding templates"
on public.featured_wedding_templates for all to authenticated
using (true) with check (true);

grant select on public.featured_wedding_templates to anon, authenticated;
grant insert, update, delete on public.featured_wedding_templates to authenticated;

create or replace function public.set_featured_wedding_templates(selected_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Bạn cần đăng nhập để quản lý mẫu nổi bật.' using errcode = '42501';
  end if;

  if coalesce(array_length(selected_ids, 1), 0) > 5 then
    raise exception 'Chỉ được chọn tối đa 5 mẫu thiệp.';
  end if;

  if (select count(*) from unnest(selected_ids) as selected(template_id))
     <> (select count(distinct template_id) from unnest(selected_ids) as selected(template_id)) then
    raise exception 'Danh sách mẫu thiệp bị trùng.';
  end if;

  if exists (
    select 1
    from unnest(selected_ids) as selected(template_id)
    left join public.wedding_templates as template on template.id = selected.template_id
    where template.id is null or template.is_visible = false
  ) then
    raise exception 'Chỉ có thể chọn mẫu thiệp đang hiển thị.';
  end if;

  -- Every valid row has sort_order from 1 to 5; the WHERE also satisfies safeupdate.
  delete from public.featured_wedding_templates
  where sort_order between 1 and 5;

  insert into public.featured_wedding_templates (template_id, sort_order)
  select template_id, position::smallint
  from unnest(selected_ids) with ordinality as selected(template_id, position);
end;
$$;

revoke all on function public.set_featured_wedding_templates(uuid[]) from public;
grant execute on function public.set_featured_wedding_templates(uuid[]) to authenticated;

notify pgrst, 'reload schema';
