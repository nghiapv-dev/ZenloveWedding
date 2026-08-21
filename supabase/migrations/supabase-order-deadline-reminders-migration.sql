-- Run after supabase-customer-orders-details-migration.sql.
-- Prevents the same deadline reminder from being sent more than once.

create table if not exists public.order_deadline_reminders (
  order_id uuid not null references public.customer_orders(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('seven_days', 'three_days')),
  sent_at timestamptz not null default now(),
  primary key (order_id, reminder_type)
);

alter table public.order_deadline_reminders enable row level security;

notify pgrst, 'reload schema';
