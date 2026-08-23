-- Trạng thái thanh toán cho trang Đơn đã hoàn thành.
alter table public.customer_orders
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid'));

-- Giữ dữ liệu cũ hợp lý: đơn có tiền cọc đủ tổng tiền được xem là đã thanh toán.
update public.customer_orders
set payment_status = 'paid'
where coalesce(total_amount, 0) > 0
  and coalesce(deposit_amount, 0) >= coalesce(total_amount, 0)
  and payment_status = 'unpaid';

notify pgrst, 'reload schema';
