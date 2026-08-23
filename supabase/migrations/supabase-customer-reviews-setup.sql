create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(trim(display_name)) between 2 and 80),
  rating smallint not null check (rating between 1 and 5),
  content text not null check (char_length(trim(content)) between 10 and 1000),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_reviews_visible_created_at_idx on public.customer_reviews (is_visible, created_at desc);
alter table public.customer_reviews enable row level security;

drop policy if exists "public can read visible customer reviews" on public.customer_reviews;
create policy "public can read visible customer reviews" on public.customer_reviews for select to anon, authenticated using (is_visible = true);
drop policy if exists "public can submit customer reviews" on public.customer_reviews;
create policy "public can submit customer reviews" on public.customer_reviews for insert to anon, authenticated with check (is_visible = true and rating between 1 and 5 and char_length(trim(display_name)) between 2 and 80 and char_length(trim(content)) between 10 and 1000);
drop policy if exists "authenticated admins manage customer reviews" on public.customer_reviews;
create policy "authenticated admins manage customer reviews" on public.customer_reviews for all to authenticated using (true) with check (true);
notify pgrst, 'reload schema';
