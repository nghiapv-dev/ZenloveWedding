create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  bride_name text,
  groom_name text,
  wedding_date date,
  package_name text,
  template_name text,
  zalo_link text,
  note text,
  status text not null default 'new' check (status in ('new', 'working', 'review', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists customer_orders_status_created_at_idx on public.customer_orders (status, created_at desc);
alter table public.customer_orders enable row level security;
drop policy if exists "public can create customer orders" on public.customer_orders;
drop policy if exists "authenticated users can manage customer orders" on public.customer_orders;
create policy "public can create customer orders" on public.customer_orders for insert to anon, authenticated with check (true);
create policy "authenticated users can manage customer orders" on public.customer_orders for all to authenticated using (true) with check (true);
notify pgrst, 'reload schema';
