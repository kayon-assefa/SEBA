-- =============================================================================
-- SEBA Subscription MVP
-- Run once in Supabase SQL Editor.
--
-- Assumptions confirmed by the supplied settings reference:
--   public.businesses(id, owner_id)
--   public.business_staff(business_id, ...)
--
-- This migration changes the old settings plan "premium" to the requested
-- MVP plan "pro" and prices Basic/Pro/Enterprise at 250/450/600 ETB.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Subscription table
-- ---------------------------------------------------------------------------
create table if not exists public.business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  plan text not null default 'basic',
  status text not null default 'trialing',
  price numeric(12,2) not null default 0,
  currency text not null default 'ETB',
  trial_start timestamptz,
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  next_billing_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Convert the old settings vocabulary before replacing the constraint.
update public.business_subscriptions
set plan = 'pro'
where plan = 'premium';

alter table public.business_subscriptions
  drop constraint if exists business_subscriptions_plan_check;

alter table public.business_subscriptions
  add constraint business_subscriptions_plan_check
  check (plan in ('basic', 'pro', 'enterprise'));

alter table public.business_subscriptions
  drop constraint if exists business_subscriptions_status_check;

alter table public.business_subscriptions
  add constraint business_subscriptions_status_check
  check (status in (
    'trialing',
    'active',
    'payment_pending',
    'past_due',
    'payment_failed',
    'cancelled',
    'expired'
  ));

-- Existing installations may have these columns under the older migration.
alter table public.business_subscriptions add column if not exists id uuid;
alter table public.business_subscriptions add column if not exists cancel_at_period_end boolean not null default false;
alter table public.business_subscriptions add column if not exists cancelled_at timestamptz;

-- If the old table already had a primary key/id, the CREATE above is a no-op.
-- The current settings migration normally already has business_id as PK/unique.
create unique index if not exists business_subscriptions_business_id_uidx
  on public.business_subscriptions(business_id);

-- ---------------------------------------------------------------------------
-- 2. Payment records
-- ---------------------------------------------------------------------------
create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  subscription_id uuid references public.business_subscriptions(id) on delete set null,
  amount numeric(12,2) not null,
  currency text not null default 'ETB',
  provider text not null default 'afripay',
  provider_reference text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists subscription_payments_business_idx
  on public.subscription_payments(business_id, created_at desc);

create index if not exists subscription_payments_provider_ref_idx
  on public.subscription_payments(provider, provider_reference);

-- ---------------------------------------------------------------------------
-- 3. Invoices
-- ---------------------------------------------------------------------------
create table if not exists public.subscription_invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  subscription_id uuid references public.business_subscriptions(id) on delete set null,
  payment_id uuid references public.subscription_payments(id) on delete set null,
  invoice_number text not null unique,
  amount numeric(12,2) not null,
  currency text not null default 'ETB',
  status text not null default 'paid'
    check (status in ('paid', 'pending', 'failed')),
  billing_period_start timestamptz,
  billing_period_end timestamptz,
  issued_at timestamptz not null default now()
);

create index if not exists subscription_invoices_business_idx
  on public.subscription_invoices(business_id, issued_at desc);

-- ---------------------------------------------------------------------------
-- 4. Timestamp trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_subscription_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists business_subscriptions_updated_at
on public.business_subscriptions;

create trigger business_subscriptions_updated_at
before update on public.business_subscriptions
for each row
execute function public.set_subscription_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Trial seed for existing businesses
-- ---------------------------------------------------------------------------
insert into public.business_subscriptions (
  business_id,
  plan,
  status,
  price,
  currency,
  trial_start,
  trial_end,
  current_period_start,
  current_period_end
)
select
  b.id,
  'basic',
  case
    when now() < (coalesce(u.created_at, b.created_at) + interval '14 days')
      then 'trialing'
    else 'expired'
  end,
  250,
  'ETB',
  coalesce(u.created_at, b.created_at),
  coalesce(u.created_at, b.created_at) + interval '14 days',
  null,
  null
from public.businesses b
left join auth.users u on u.id = b.owner_id
where not exists (
  select 1
  from public.business_subscriptions s
  where s.business_id = b.id
);

-- ---------------------------------------------------------------------------
-- 6. RLS
-- ---------------------------------------------------------------------------
alter table public.business_subscriptions enable row level security;
alter table public.subscription_payments enable row level security;
alter table public.subscription_invoices enable row level security;

drop policy if exists "subscription owners can read" on public.business_subscriptions;
create policy "subscription owners can read"
on public.business_subscriptions
for select
to authenticated
using (
  exists (
    select 1 from public.businesses b
    where b.id = business_subscriptions.business_id
      and b.owner_id = auth.uid()
  )
);

-- IMPORTANT:
-- Do not grant normal owners arbitrary INSERT/UPDATE access to plan/status.
-- Payment activation belongs to trusted server/Edge Function code.
-- The cancellation/reactivation RPCs below are the controlled client actions.

drop policy if exists "payment owners can read" on public.subscription_payments;
create policy "payment owners can read"
on public.subscription_payments
for select
to authenticated
using (
  exists (
    select 1 from public.businesses b
    where b.id = subscription_payments.business_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "invoice owners can read" on public.subscription_invoices;
create policy "invoice owners can read"
on public.subscription_invoices
for select
to authenticated
using (
  exists (
    select 1 from public.businesses b
    where b.id = subscription_invoices.business_id
      and b.owner_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- 7. Controlled cancellation
-- ---------------------------------------------------------------------------
create or replace function public.request_subscription_cancellation(
  p_business_id uuid
)
returns public.business_subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  row_out public.business_subscriptions;
begin
  if not exists (
    select 1 from public.businesses
    where id = p_business_id
      and owner_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  update public.business_subscriptions
  set
    cancel_at_period_end = true,
    cancelled_at = now(),
    status = case
      when status = 'active' then 'cancelled'
      else status
    end,
    updated_at = now()
  where business_id = p_business_id
  returning * into row_out;

  if row_out.id is null then
    raise exception 'Subscription not found';
  end if;

  return row_out;
end;
$$;

revoke all on function public.request_subscription_cancellation(uuid)
from public;

grant execute on function public.request_subscription_cancellation(uuid)
to authenticated;

-- ---------------------------------------------------------------------------
-- 8. Controlled reactivation
-- ---------------------------------------------------------------------------
create or replace function public.reactivate_subscription(
  p_business_id uuid
)
returns public.business_subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  row_out public.business_subscriptions;
begin
  if not exists (
    select 1 from public.businesses
    where id = p_business_id
      and owner_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  update public.business_subscriptions
  set
    cancel_at_period_end = false,
    cancelled_at = null,
    status = case
      when status = 'cancelled' then 'active'
      else status
    end,
    updated_at = now()
  where business_id = p_business_id
  returning * into row_out;

  if row_out.id is null then
    raise exception 'Subscription not found';
  end if;

  return row_out;
end;
$$;

revoke all on function public.reactivate_subscription(uuid)
from public;

grant execute on function public.reactivate_subscription(uuid)
to authenticated;

commit;

-- =============================================================================
-- IMPORTANT AFTER RUNNING
-- =============================================================================
-- 1. Keep payment INSERT/UPDATE and subscription activation server-side.
-- 2. Create a Supabase Edge Function named:
--       create-afripay-payment
-- 3. The function should validate:
--       basic = 250 ETB
--       pro = 450 ETB
--       enterprise = 600 ETB
-- 4. It should create a pending payment and return:
--       { "checkout_url": "...", "payment_id": "..." }
-- 5. AfriPay webhook should verify the transaction before setting:
--       subscription_payments.status = 'paid'
--       business_subscriptions.status = 'active'
--       business_subscriptions.plan = verified plan
-- 6. Create an invoice only after confirmed payment.
--
-- Do NOT put AfriPay secrets in the React/Vite frontend.
