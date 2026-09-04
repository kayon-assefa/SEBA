-- =============================================================================
-- SEBA Staff — Supabase migration
-- =============================================================================
-- Safe to run more than once — everything uses IF NOT EXISTS / ADD COLUMN IF
-- NOT EXISTS / CREATE OR REPLACE. Run this in the Supabase SQL editor, or via
-- `supabase db push` if you keep migrations in a migrations/ folder.
--
-- WHAT CHANGED FROM THE PREVIOUS staff_v2_migration.sql
-- -----------------------------------------------------------------------------
-- The previous migration's header comment (and the staff app's own code)
-- assumed the appointments table had a `customer_phone` column. It doesn't —
-- the real column, written by the owner-facing app, is `phone`. That mismatch
-- meant the staff app's phone numbers, repeat-customer detection, and visit
-- history were always silently blank. This migration does NOT rename
-- anything (renaming a live column is your call, not a migration script's) —
-- the fix is entirely in the app code, which now reads `phone` correctly.
-- This file just adds the columns that were still genuinely missing.
--
-- It also drops the `email_enabled` notification preference. SEBA staff
-- notifications are SMS + push + in-app only — email was never wired up to
-- actually send anything, so the toggle did nothing. The column is left in
-- place (harmless, unused) rather than dropped, in case you have other code
-- depending on it; the app just no longer shows or writes to it.
--
-- Expected base schema (from the owner-facing app):
--   business_staff(id, user_id, business_id, full_name, email, role, is_active)
--   appointments(id, business_id, customer, phone, service, services[], staff,
--                staff_members[], date, time, duration, status, payment_status,
--                deposit_amount, price, created_at)
--   orders(id, business_id, customer_name, customer_phone, status,
--          payment_status, created_at)
--   customers(id, business_id, name, phone, email, created_at)
--
-- If your actual column names differ, check the Table Editor before running.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------- helper: short random code for QR passes ----------
create or replace function seba_short_code() returns text as $$
  select upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
$$ language sql volatile;

-- =============================================================================
-- 0. CRITICAL — staff permissions on the core tables
-- =============================================================================
-- If staff members are getting errors like:
--   "new row violates row-level security policy for table \"orders\""
--   "new row violates row-level security policy for table \"customers\""
-- it's because appointments/orders/customers almost certainly only have RLS
-- policies written for the BUSINESS OWNER's own auth.uid() — not for staff
-- logins (business_staff rows), which are a different auth.uid() with no
-- ownership relationship to the business. This section adds policies that
-- let any active staff member of a business read/write that business's
-- appointments, orders, and customers. These are ADDITIONAL permissive
-- policies — they don't remove or replace whatever access the owner app
-- already has.
alter table appointments enable row level security;
alter table orders enable row level security;
alter table customers enable row level security;

drop policy if exists "seba staff full access to appointments" on appointments;
create policy "seba staff full access to appointments" on appointments
  for all using (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  ) with check (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  );

drop policy if exists "seba staff full access to orders" on orders;
create policy "seba staff full access to orders" on orders
  for all using (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  ) with check (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  );

drop policy if exists "seba staff full access to customers" on customers;
create policy "seba staff full access to customers" on customers
  for all using (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  ) with check (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  );

-- Staff members also need to be able to update their OWN name/language —
-- this is what makes "Save profile" / the language switcher actually stick.
alter table business_staff enable row level security;

drop policy if exists "staff can read own business roster" on business_staff;
create policy "staff can read own business roster" on business_staff
  for select using (
    business_id in (select business_id from business_staff bs2 where bs2.user_id = auth.uid() and bs2.is_active)
  );

drop policy if exists "staff can update own profile row" on business_staff;
create policy "staff can update own profile row" on business_staff
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Staff also need read access to the bookable `staff` and `services` and
-- `products` tables (these power the Add Appointment / Add Order dropdowns).
alter table staff enable row level security;
alter table services enable row level security;
alter table products enable row level security;

drop policy if exists "seba staff can read bookable staff" on staff;
create policy "seba staff can read bookable staff" on staff
  for select using (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  );

drop policy if exists "seba staff can read services" on services;
create policy "seba staff can read services" on services
  for select using (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  );

drop policy if exists "seba staff can read products" on products;
create policy "seba staff can read products" on products
  for select using (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  );

-- Loosen NOT NULL constraints that only make sense from the owner app's own
-- booking flow (which always fills them). The staff app's Add Appointment
-- form now REQUIRES picking a real staff member and service before it will
-- submit, but this is a defensive backstop in case your schema currently
-- has stricter constraints than the owner app's own code relies on —
-- e.g. `appointments.service` defaults to `''` (not null) in the owner app,
-- which these two lines make explicit and safe:
alter table appointments alter column service set default '';
update appointments set service = '' where service is null;
-- `staff` is allowed to be null in the owner app's own code, so if your
-- database currently has it as NOT NULL, this brings the constraint back in
-- line with what the owner app itself actually writes:
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'appointments' and column_name = 'staff' and is_nullable = 'NO'
  ) then
    alter table appointments alter column staff drop not null;
  end if;
end $$;

-- =============================================================================
-- 1. Appointments — QR pass, notes, recurring flag, and any columns the
--    owner app already uses that an older staff install might predate.
-- =============================================================================
alter table appointments add column if not exists qr_code text;
alter table appointments add column if not exists notes text;
alter table appointments add column if not exists is_recurring boolean default false;
alter table appointments add column if not exists staff text;
alter table appointments add column if not exists staff_members text[];
alter table appointments add column if not exists services text[];
alter table appointments add column if not exists duration integer;
alter table appointments add column if not exists end_time time;
alter table appointments add column if not exists price numeric(10,2);
alter table appointments add column if not exists deposit_amount numeric(10,2);
alter table appointments add column if not exists payment_status text;

update appointments set qr_code = seba_short_code() where qr_code is null;
alter table appointments alter column qr_code set default seba_short_code();
create unique index if not exists appointments_qr_code_key on appointments (qr_code);

-- =============================================================================
-- 2. Orders — line items, total, notes, QR pass
-- =============================================================================
alter table orders add column if not exists items jsonb;              -- [{ "name": "...", "qty": 1, "price": 0 }]
alter table orders add column if not exists total_amount numeric(10,2);
alter table orders add column if not exists notes text;
alter table orders add column if not exists qr_code text;

update orders set qr_code = seba_short_code() where qr_code is null;
alter table orders alter column qr_code set default seba_short_code();
create unique index if not exists orders_qr_code_key on orders (qr_code);

-- If the Orders feature's customer receipt QR is later updated to encode
-- `SEBA:ORDER:<qr_code>` instead of a plain receipt URL, this index is what
-- makes that lookup fast. Until then, the staff app's scanner (utils/qr.ts)
-- also resolves the *current* receipt URL by parsing the order's UUID out of
-- it and matching against `orders.id` directly — so scanning works today
-- without waiting on that change.
create index if not exists orders_id_lookup_idx on orders (id);

-- =============================================================================
-- 3. Customers — tags, notes (VIP flags, allergies, preferences, etc.)
-- =============================================================================
alter table customers add column if not exists tags text[] default '{}';
alter table customers add column if not exists notes text;

-- =============================================================================
-- 4. Staff language preference (English / Amharic / Tigrigna / Afaan Oromo)
-- =============================================================================
alter table business_staff add column if not exists language text default 'en'
  check (language in ('en', 'am', 'ti', 'om'));

-- =============================================================================
-- 5. In-app staff notifications
-- =============================================================================
create table if not exists staff_notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  staff_id uuid references business_staff(id) on delete cascade,   -- null = broadcast to whole business
  title text not null,
  body text not null,
  type text not null default 'system' check (type in ('appointment','order','system','reminder')),
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists staff_notifications_business_idx on staff_notifications (business_id, created_at desc);
create index if not exists staff_notifications_staff_idx on staff_notifications (staff_id);

alter table staff_notifications enable row level security;

drop policy if exists "staff can read own business notifications" on staff_notifications;
create policy "staff can read own business notifications" on staff_notifications
  for select using (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  );

drop policy if exists "staff can update own business notifications" on staff_notifications;
create policy "staff can update own business notifications" on staff_notifications
  for update using (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  );

drop policy if exists "staff can insert own business notifications" on staff_notifications;
create policy "staff can insert own business notifications" on staff_notifications
  for insert with check (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  );

-- =============================================================================
-- 6. Notification preferences — SMS + push only (no email; see header note)
-- =============================================================================
create table if not exists staff_notification_prefs (
  staff_id uuid primary key references business_staff(id) on delete cascade,
  business_id uuid not null,
  sms_enabled boolean not null default false,
  push_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

-- If you're upgrading from staff_v2 (which had `email_enabled`), that column
-- is left as-is — the app just stops reading/writing it. Uncomment to remove
-- it outright once you've confirmed nothing else depends on it:
-- alter table staff_notification_prefs drop column if exists email_enabled;

alter table staff_notification_prefs enable row level security;

drop policy if exists "staff manage own prefs" on staff_notification_prefs;
create policy "staff manage own prefs" on staff_notification_prefs
  for all using (
    staff_id in (select id from business_staff where user_id = auth.uid())
  ) with check (
    staff_id in (select id from business_staff where user_id = auth.uid())
  );

-- =============================================================================
-- 7. Push subscriptions (web push endpoints — see utils/push.ts)
-- =============================================================================
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references business_staff(id) on delete cascade,
  business_id uuid not null,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

drop policy if exists "staff manage own push subscriptions" on push_subscriptions;
create policy "staff manage own push subscriptions" on push_subscriptions
  for all using (
    staff_id in (select id from business_staff where user_id = auth.uid())
  ) with check (
    staff_id in (select id from business_staff where user_id = auth.uid())
  );

-- =============================================================================
-- 8. Staff shifts (roster)
-- =============================================================================
create table if not exists staff_shifts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  staff_id uuid not null references business_staff(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  note text
);
create index if not exists staff_shifts_business_date_idx on staff_shifts (business_id, date);

alter table staff_shifts enable row level security;

drop policy if exists "staff can read own business shifts" on staff_shifts;
create policy "staff can read own business shifts" on staff_shifts
  for select using (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active)
  );

drop policy if exists "managers can manage shifts" on staff_shifts;
create policy "managers can manage shifts" on staff_shifts
  for all using (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active and role in ('admin','manager'))
  ) with check (
    business_id in (select business_id from business_staff where user_id = auth.uid() and is_active and role in ('admin','manager'))
  );

-- =============================================================================
-- 9. Time-off requests
-- =============================================================================
create table if not exists staff_time_off (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  staff_id uuid not null references business_staff(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','denied')),
  created_at timestamptz not null default now()
);

alter table staff_time_off enable row level security;

drop policy if exists "staff manage own time off" on staff_time_off;
create policy "staff manage own time off" on staff_time_off
  for all using (
    staff_id in (select id from business_staff where user_id = auth.uid())
    or business_id in (select business_id from business_staff where user_id = auth.uid() and role in ('admin','manager'))
  ) with check (
    staff_id in (select id from business_staff where user_id = auth.uid())
    or business_id in (select business_id from business_staff where user_id = auth.uid() and role in ('admin','manager'))
  );

-- =============================================================================
-- 10. Auto-notify staff when a new appointment/order comes in
-- =============================================================================
create or replace function seba_notify_new_appointment() returns trigger as $$
begin
  insert into staff_notifications (business_id, staff_id, title, body, type, link)
  values (
    new.business_id, null,
    'New appointment', new.customer || ' booked ' || coalesce(new.service, 'a service'),
    'appointment', '/staff/appointments'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists seba_appointment_notify on appointments;
create trigger seba_appointment_notify
  after insert on appointments
  for each row execute function seba_notify_new_appointment();

create or replace function seba_notify_new_order() returns trigger as $$
begin
  insert into staff_notifications (business_id, staff_id, title, body, type, link)
  values (
    new.business_id, null,
    'New order', coalesce(new.customer_name, 'A customer') || ' placed an order',
    'order', '/staff/orders'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists seba_order_notify on orders;
create trigger seba_order_notify
  after insert on orders
  for each row execute function seba_notify_new_order();

-- =============================================================================
-- Done. Sanity checks:
-- =============================================================================
-- select id, customer, phone, staff, status, payment_status, qr_code from appointments order by created_at desc limit 5;
-- select id, customer_name, customer_phone, qr_code from orders order by created_at desc limit 5;
-- select * from staff_notifications order by created_at desc limit 5;
-- select id, full_name, language from business_staff limit 5;
-- select id, name from staff limit 5;
-- select id, name, price from services limit 5;
-- select id, name, price from products limit 5;
