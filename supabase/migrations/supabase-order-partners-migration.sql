-- Run this once in Supabase SQL Editor.
-- Studio and CTV are separate lists; an order references one of them when applicable.

create table if not exists public.order_studios (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.order_collaborators (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.customer_orders
  add column if not exists order_source text not null default 'customer'
    check (order_source in ('customer', 'studio', 'collaborator')),
  add column if not exists partner_name text,
  add column if not exists studio_id uuid references public.order_studios(id) on delete set null,
  add column if not exists collaborator_id uuid references public.order_collaborators(id) on delete set null;

create index if not exists customer_orders_source_created_at_idx
  on public.customer_orders (order_source, created_at desc);

alter table public.order_studios enable row level security;
alter table public.order_collaborators enable row level security;

drop policy if exists "authenticated users can manage order studios" on public.order_studios;
create policy "authenticated users can manage order studios" on public.order_studios
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can manage order collaborators" on public.order_collaborators;
create policy "authenticated users can manage order collaborators" on public.order_collaborators
  for all to authenticated using (true) with check (true);

notify pgrst, 'reload schema';
