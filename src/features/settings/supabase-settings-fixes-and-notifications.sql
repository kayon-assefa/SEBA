-- =============================================================================
-- SEBA — Settings fixes + Notifications system
-- Run this ONCE in the Supabase SQL editor, after supabase-settings-production.sql
-- Safe to re-run (uses "if not exists" / "on conflict" everywhere).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. business_settings: add the "reopens on" date used by the temporarily-closed
--    flow, and make sure is_published defaults to true (businesses are always
--    published — it's no longer a setting the owner can toggle off).
-- -----------------------------------------------------------------------------
alter table public.business_settings
  add column if not exists temporary_close_until timestamptz;

alter table public.business_settings
  alter column is_published set default true;

update public.business_settings set is_published = true where is_published is distinct from true;

-- -----------------------------------------------------------------------------
-- 2. notifications table
-- -----------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade, -- null = whole business
  type text not null check (type in (
    'new_order', 'new_appointment', 'appointment_cancelled', 'appointment_rescheduled',
    'staff_login', 'new_customer', 'customer_unpaid', 'payment_failed',
    'subscription_expiring', 'staff_added', 'staff_removed', 'page_published',
    'broadcast'
  )),
  title text not null,
  body text,
  data jsonb default '{}'::jsonb,       -- e.g. { "order_id": "...", "url": "/orders/123" }
  read boolean not null default false,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_business_idx on public.notifications (business_id, created_at desc);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (business_id, read) where read = false;

alter table public.notifications enable row level security;

drop policy if exists "users read their business notifications" on public.notifications;
create policy "users read their business notifications"
on public.notifications for select
to authenticated
using (
  business_id in (select id from public.businesses where owner_id = auth.uid())
  or user_id = auth.uid()
);

drop policy if exists "users update their business notifications" on public.notifications;
create policy "users update their business notifications"
on public.notifications for update
to authenticated
using (
  business_id in (select id from public.businesses where owner_id = auth.uid())
  or user_id = auth.uid()
);

-- inserts happen from trusted server code (edge functions / triggers), not directly from the client
drop policy if exists "service role inserts notifications" on public.notifications;
create policy "service role inserts notifications"
on public.notifications for insert
to service_role
with check (true);

-- -----------------------------------------------------------------------------
-- 3. push_subscriptions table — one row per browser/device that opted in to push
-- -----------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "users manage their own push subscriptions" on public.push_subscriptions;
create policy "users manage their own push subscriptions"
on public.push_subscriptions for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 4. notification_preferences — per user, per channel, per type
-- -----------------------------------------------------------------------------
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  push_enabled boolean not null default true,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false, -- reserved, SMS is "coming soon"
  muted_types text[] not null default '{}',
  quiet_hours_start time,
  quiet_hours_end time,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

drop policy if exists "users manage their own notification prefs" on public.notification_preferences;
create policy "users manage their own notification prefs"
on public.notification_preferences for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 5. Realtime — allow the notifications table to stream to clients
-- -----------------------------------------------------------------------------
alter publication supabase_realtime add table public.notifications;

-- -----------------------------------------------------------------------------
-- 6. Helper function + trigger stubs you can call from your existing order /
--    appointment / staff / customer code to create a notification row.
--    Example: select public.create_notification(business_id, null, 'new_order',
--             'New order received', 'Order #1042 — 450 ETB', '{"order_id":"1042"}');
-- -----------------------------------------------------------------------------
create or replace function public.create_notification(
  p_business_id uuid,
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text default null,
  p_data jsonb default '{}'::jsonb
) returns public.notifications
language plpgsql
security definer
as $$
declare
  row_out public.notifications;
begin
  insert into public.notifications (business_id, user_id, type, title, body, data)
  values (p_business_id, p_user_id, p_type, p_title, p_body, p_data)
  returning * into row_out;
  return row_out;
end;
$$;

-- -----------------------------------------------------------------------------
-- 7. Auto-expire old notifications (keep the table small). Call this from a
--    scheduled Supabase cron job (Database > Cron) e.g. daily.
-- -----------------------------------------------------------------------------
create or replace function public.expire_old_notifications() returns void
language sql
as $$
  delete from public.notifications where created_at < now() - interval '90 days' and read = true;
$$;
