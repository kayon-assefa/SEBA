-- Appointments module upgrade - run this once in the Supabase SQL editor.
-- Safe to re-run: every statement uses IF NOT EXISTS / IF EXISTS.

-- 1. New columns on the existing appointments table
alter table appointments
  add column if not exists customer_id uuid,
  add column if not exists services text[] default '{}',
  add column if not exists staff_members text[] default '{}',
  add column if not exists duration integer default 30,
  add column if not exists end_time text,
  add column if not exists payment_status text default 'Unpaid',
  add column if not exists deposit_amount numeric default 0,
  add column if not exists discount_code text,
  add column if not exists recurrence_frequency text,
  add column if not exists recurrence_occurrences integer,
  add column if not exists recurrence_group_id uuid,
  add column if not exists reminder_sms_sent boolean default false,
  add column if not exists reminder_email_sent boolean default false,
  add column if not exists reminder_whatsapp_sent boolean default false,
  add column if not exists staff_reminder_sent boolean default false;

-- Backfill the new array columns from the old single-value columns so
-- existing appointments still show up correctly.
update appointments
set services = array[service]
where services is null or array_length(services, 1) is null;

update appointments
set staff_members = array[staff]
where staff is not null and (staff_members is null or array_length(staff_members, 1) is null);

update appointments
set end_time = to_char((time::time + (coalesce(duration, 30) || ' minutes')::interval), 'HH24:MI')
where end_time is null;

-- Allow the new status values used by the UI (Waitlisted)
-- Skip this if your `status` column is a free-text column rather than an enum/check.
-- alter table appointments drop constraint if exists appointments_status_check;
-- alter table appointments add constraint appointments_status_check
--   check (status in ('Pending','Confirmed','Completed','Cancelled','No-show','Waitlisted'));

-- 2. Customers table (skip if you already have one - just make sure the
--    column names below match what customer.service.ts expects, or edit
--    that file to match your existing table).
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  name text not null,
  phone text,
  email text,
  notes text,
  tags text[] default '{}',
  total_visits integer default 0,
  total_spent numeric default 0,
  created_at timestamptz default now(),
  last_visit date
);

create index if not exists customers_business_phone_idx on customers (business_id, phone);

alter table appointments
  add constraint if not exists appointments_customer_id_fkey
  foreign key (customer_id) references customers(id) on delete set null;
