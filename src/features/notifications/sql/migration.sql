-- ============================================================
-- SEBA Notifications module — database migration
-- Run this once in your Supabase project's SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- Safe to re-run: every statement uses IF NOT EXISTS / OR REPLACE.
-- ============================================================

-- ---------------------------------------------------------------
-- 1. notifications table
-- ---------------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,

  category text not null check (category in ('order','appointment','customer','auth','system')),
  severity text not null default 'info' check (severity in ('info','warning','success')),

  title text not null,
  body text not null default '',

  link text,
  entity_type text,
  entity_id text,

  read boolean not null default false,
  read_at timestamptz,

  created_at timestamptz not null default now()
);

create index if not exists notifications_business_created_idx
  on notifications (business_id, created_at desc);

create index if not exists notifications_business_unread_idx
  on notifications (business_id, read) where read = false;

-- ---------------------------------------------------------------
-- 2. push_subscriptions — one row per browser/device that opted in
-- ---------------------------------------------------------------
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  user_id uuid not null,

  endpoint text not null,
  p256dh text not null,
  auth text not null,

  created_at timestamptz not null default now(),

  unique (user_id, endpoint)
);

create index if not exists push_subscriptions_business_idx
  on push_subscriptions (business_id);

-- ---------------------------------------------------------------
-- 3. notification_settings — one row per (user, business)
-- ---------------------------------------------------------------
create table if not exists notification_settings (
  user_id uuid not null,
  business_id uuid not null,

  categories_enabled jsonb not null default
    '{"order":true,"appointment":true,"customer":true,"auth":true,"system":true}'::jsonb,

  push_enabled boolean not null default false,
  sound_enabled boolean not null default true,

  quiet_hours_enabled boolean not null default false,
  quiet_hours_start text not null default '21:00',
  quiet_hours_end text not null default '08:00',

  unpaid_digest_enabled boolean not null default true,

  updated_at timestamptz default now(),

  primary key (user_id, business_id)
);

-- ---------------------------------------------------------------
-- 4. Row Level Security — a business only ever sees its own rows.
--    Matches the ownership model used elsewhere in the app:
--    businesses.id == owner's auth.uid(), staff belong to a
--    business via staff_profiles(user_id, business_id, status).
-- ---------------------------------------------------------------
alter table notifications enable row level security;
alter table push_subscriptions enable row level security;
alter table notification_settings enable row level security;

create or replace function _seba_my_business_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select auth.uid()
  union
  select business_id from staff_profiles
  where user_id = auth.uid()
    and coalesce(status, 'active') = 'active';
$$;

drop policy if exists notifications_select on notifications;
create policy notifications_select on notifications
  for select using (business_id in (select _seba_my_business_ids()));

drop policy if exists notifications_update on notifications;
create policy notifications_update on notifications
  for update using (business_id in (select _seba_my_business_ids()));

drop policy if exists notifications_delete on notifications;
create policy notifications_delete on notifications
  for delete using (business_id in (select _seba_my_business_ids()));

-- Inserts happen from SECURITY DEFINER triggers below (owned by the DB,
-- not the browser), so no client-side insert policy is granted here —
-- this is what keeps a compromised browser session from forging
-- notifications for other businesses.

drop policy if exists push_subscriptions_all on push_subscriptions;
create policy push_subscriptions_all on push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notification_settings_all on notification_settings;
create policy notification_settings_all on notification_settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------
-- 5. Auto-generate notifications with triggers on your existing
--    tables. Each trigger runs as SECURITY DEFINER so it can insert
--    into `notifications` regardless of the caller's RLS grants.
-- ---------------------------------------------------------------

-- Orders: new order + status change
create or replace function _seba_notify_order()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    insert into notifications (business_id, category, severity, title, body, link, entity_type, entity_id)
    values (
      new.business_id, 'order', 'info',
      'New order' || case when new.order_number is not null then ' #' || new.order_number else '' end,
      coalesce(new.customer_name, 'A customer') || ' placed an order' ||
        case when new.total is not null then ' for ' || new.total::text else '' end,
      '/orders?id=' || new.id,
      'order', new.id::text
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into notifications (business_id, category, severity, title, body, link, entity_type, entity_id)
    values (
      new.business_id, 'order', 'info',
      'Order status updated',
      'Order' || case when new.order_number is not null then ' #' || new.order_number else '' end ||
        ' is now "' || new.status || '"',
      '/orders?id=' || new.id,
      'order', new.id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_order on orders;
create trigger trg_notify_order
  after insert or update on orders
  for each row execute function _seba_notify_order();

-- Appointments: new booking + cancelled/no-show
create or replace function _seba_notify_appointment()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    insert into notifications (business_id, category, severity, title, body, link, entity_type, entity_id)
    values (
      new.business_id, 'appointment', 'info',
      'New appointment',
      coalesce(new.customer, 'A customer') || ' booked ' || coalesce(new.service, 'a service') ||
        ' on ' || new.date::text || ' at ' || new.time,
      '/appointments?id=' || new.id,
      'appointment', new.id::text
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status
        and new.status in ('Cancelled', 'No-show') then
    insert into notifications (business_id, category, severity, title, body, link, entity_type, entity_id)
    values (
      new.business_id, 'appointment', 'warning',
      'Appointment ' || lower(new.status),
      coalesce(new.customer, 'A customer') || '''s appointment on ' || new.date::text || ' is now ' || new.status,
      '/appointments?id=' || new.id,
      'appointment', new.id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_appointment on appointments;
create trigger trg_notify_appointment
  after insert or update on appointments
  for each row execute function _seba_notify_appointment();

-- Customers: new customer
create or replace function _seba_notify_customer()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    insert into notifications (business_id, category, severity, title, body, link, entity_type, entity_id)
    values (
      new.business_id, 'customer', 'success',
      'New customer',
      coalesce(new.name, 'Someone') || ' was added to your customers',
      '/customers?id=' || new.id,
      'customer', new.id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_customer on customers;
create trigger trg_notify_customer
  after insert on customers
  for each row execute function _seba_notify_customer();

-- ---------------------------------------------------------------
-- 6. Unpaid-customer daily digest (one notification per business
--    per day, not one per unpaid customer). Call this from a
--    scheduled Supabase cron job (pg_cron) once a day — see README.
-- ---------------------------------------------------------------
create or replace function seba_run_unpaid_digest()
returns void
language plpgsql
security definer
as $$
declare
  biz record;
  unpaid_count int;
begin
  for biz in
    select distinct business_id from appointments where payment_status = 'Unpaid'
    union
    select distinct business_id from orders where payment_status = 'pending'
  loop
    select count(*) into unpaid_count
    from (
      select id from appointments where business_id = biz.business_id and payment_status = 'Unpaid'
      union
      select id from orders where business_id = biz.business_id and payment_status = 'pending'
    ) x;

    if unpaid_count > 0 then
      insert into notifications (business_id, category, severity, title, body, link)
      values (
        biz.business_id, 'customer', 'warning',
        'Unpaid balances',
        unpaid_count || ' order' || case when unpaid_count = 1 then '' else 's' end ||
          '/appointment' || case when unpaid_count = 1 then '' else 's' end || ' still unpaid today',
        '/customers'
      );
    end if;
  end loop;
end;
$$;

-- Optional: schedule the digest daily at 08:00, if pg_cron is enabled
-- on your project (Dashboard → Database → Extensions → pg_cron).
-- select cron.schedule('seba-unpaid-digest', '0 8 * * *', 'select seba_run_unpaid_digest();');

-- ---------------------------------------------------------------
-- 7. Realtime — make sure the notifications table streams to the
--    client the same way orders/appointments already do.
-- ---------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table notifications;
  end if;
end $$;
