-- ============================================================
-- SEBA Orders module — database migration
-- Run this once in your Supabase project's SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- Safe to re-run: every statement uses IF NOT EXISTS.
-- ============================================================

-- ---- products: stock tracking ----
alter table products
  add column if not exists stock_quantity integer default 0;

alter table products
  add column if not exists track_stock boolean default false;
-- track_stock = false means "always in stock" (no stock badges shown).
-- Turn it on per-product once you start tracking quantities.

-- ---- businesses: public slug for receipt QR links ----
alter table businesses
  add column if not exists slug text;

-- backfill slugs for existing businesses that don't have one yet
update businesses
set slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
where slug is null;

create unique index if not exists businesses_slug_key
  on businesses (slug);

-- ---- orders: delivery, financials, receipt, history ----
alter table orders add column if not exists order_number text;

alter table orders add column if not exists delivery_type text default 'pickup';
alter table orders add column if not exists delivery_address text;
alter table orders add column if not exists scheduled_at timestamptz;
alter table orders add column if not exists estimated_ready_at timestamptz;

alter table orders add column if not exists discount numeric default 0;
alter table orders add column if not exists tax numeric default 0;
alter table orders add column if not exists amount_paid numeric default 0;

alter table orders add column if not exists telegram_chat_id text;
alter table orders add column if not exists status_history jsonb default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_delivery_type_check'
  ) then
    alter table orders
      add constraint orders_delivery_type_check
      check (delivery_type in ('pickup', 'delivery'));
  end if;
end $$;

-- ---- order_number: human-friendly sequential number per business ----
create sequence if not exists orders_order_number_seq;

create or replace function set_order_number()
returns trigger as $$
begin
  if new.order_number is null then
    new.order_number := to_char(now(), 'YYMMDD') || '-' ||
      lpad(nextval('orders_order_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_order_number on orders;

create trigger trg_set_order_number
before insert on orders
for each row execute function set_order_number();

-- ---- realtime: make sure orders are broadcast on change ----
-- (skip if your project already has this table in the publication)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table orders;
  end if;
end $$;

-- ============================================================
-- Done. After running this, restart your dev server so the app
-- picks up the new columns.
-- ============================================================
