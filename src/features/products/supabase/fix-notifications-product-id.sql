-- Repair existing databases where `notifications` was created before the
-- product low-stock feature. Safe to run more than once.

alter table public.notifications
  add column if not exists product_id uuid
  references public.products(id) on delete set null;

create index if not exists notifications_product_id_idx
  on public.notifications (product_id);

-- Recreate the trigger function so creating a low-stock product succeeds.
create or replace function public.fn_notify_low_stock()
returns trigger
language plpgsql
as $$
begin
  if new.stock <= coalesce(new.low_stock_threshold, 5)
     and (tg_op = 'INSERT' or old.stock > coalesce(new.low_stock_threshold, 5)) then
    insert into public.notifications (business_id, type, title, body, product_id)
    values (
      new.business_id,
      'low_stock',
      'Low stock: ' || new.name,
      new.name || ' has ' || new.stock || ' ' || coalesce(new.unit, 'pcs') || ' left.',
      new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_low_stock on public.products;
create trigger trg_notify_low_stock
  after insert or update of stock on public.products
  for each row execute function public.fn_notify_low_stock();
