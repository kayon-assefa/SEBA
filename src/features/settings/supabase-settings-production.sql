-- SEBA settings production migration
-- Run this once in Supabase SQL Editor.

create table if not exists public.business_subscriptions (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  plan text not null default 'basic' check (plan in ('basic','premium','enterprise')),
  status text not null default 'trialing' check (status in ('trialing','active','past_due','cancelled','expired')),
  price numeric(12,2) not null default 0,
  currency text not null default 'ETB',
  trial_start timestamptz,
  trial_end timestamptz,
  start_date timestamptz not null default now(),
  end_date timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  next_billing_date timestamptz,
  billing_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_subscriptions enable row level security;

drop policy if exists "business owners can read subscription" on public.business_subscriptions;
create policy "business owners can read subscription"
on public.business_subscriptions for select
using (
  exists (
    select 1 from public.businesses b
    where b.id = business_subscriptions.business_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "business owners can insert subscription" on public.business_subscriptions;
create policy "business owners can insert subscription"
on public.business_subscriptions for insert
with check (
  exists (
    select 1 from public.businesses b
    where b.id = business_subscriptions.business_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "business owners can update subscription" on public.business_subscriptions;
create policy "business owners can update subscription"
on public.business_subscriptions for update
using (
  exists (
    select 1 from public.businesses b
    where b.id = business_subscriptions.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses b
    where b.id = business_subscriptions.business_id
      and b.owner_id = auth.uid()
  )
);

-- Seed a 14-day trial for every existing business that does not have a subscription.
insert into public.business_subscriptions (
  business_id, plan, status, price, currency,
  trial_start, trial_end, start_date, end_date
)
select
  b.id,
  'basic',
  case
    when now() < (coalesce(u.created_at, b.created_at) + interval '14 days') then 'trialing'
    else 'expired'
  end,
  0,
  'ETB',
  coalesce(u.created_at, b.created_at),
  coalesce(u.created_at, b.created_at) + interval '14 days',
  coalesce(u.created_at, b.created_at),
  coalesce(u.created_at, b.created_at) + interval '14 days'
from public.businesses b
left join auth.users u on u.id = b.owner_id
where not exists (
  select 1 from public.business_subscriptions bs
  where bs.business_id = b.id
);

-- Keep the timestamp fields current when a subscription is updated.
create or replace function public.set_business_subscription_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists business_subscriptions_updated_at on public.business_subscriptions;
create trigger business_subscriptions_updated_at
before update on public.business_subscriptions
for each row execute function public.set_business_subscription_updated_at();

-- Storage bucket for the General > Company image upload.
insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "business owners can upload business assets" on storage.objects;
create policy "business owners can upload business assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "business owners can update business assets" on storage.objects;
create policy "business owners can update business assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "business owners can delete business assets" on storage.objects;
create policy "business owners can delete business assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "public can read business assets" on storage.objects;
create policy "public can read business assets"
on storage.objects for select
to public
using (bucket_id = 'business-assets');
