-- Run this once in Supabase SQL Editor to enable the expanded admin order form.
-- Existing orders remain unchanged.

alter table public.customer_orders
  add column if not exists selected_services text[] not null default '{}',
  add column if not exists wedding_template_name text,
  add column if not exists slide_template_name text,
  add column if not exists slide_photo_count integer,
  add column if not exists background_template_name text,
  add column if not exists expected_delivery_date date,
  add column if not exists total_amount numeric not null default 0,
  add column if not exists deposit_amount numeric not null default 0;

notify pgrst, 'reload schema';
