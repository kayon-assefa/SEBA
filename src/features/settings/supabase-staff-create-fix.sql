-- Staff account setup/fix for Settings > Staff.
-- Run this once in the Supabase SQL Editor.

begin;

create table if not exists public.business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  plan text not null default 'basic',
  status text not null default 'trialing',
  price numeric(12,2) not null default 0,
  currency text not null default 'ETB',
  trial_start timestamptz,
  trial_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_staff (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid unique references auth.users(id) on delete cascade,
  branch_id uuid null,
  full_name text not null,
  email text not null,
  role text not null default 'receptionist',
  permissions jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  invitation_status text not null default 'accepted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_staff_role_check
    check (role in ('receptionist', 'manager', 'accountant', 'staff', 'custom')),
  constraint business_staff_invitation_status_check
    check (invitation_status in ('pending', 'accepted', 'disabled'))
);

alter table public.business_staff add column if not exists user_id uuid unique references auth.users(id) on delete cascade;
alter table public.business_staff add column if not exists branch_id uuid null;
alter table public.business_staff add column if not exists permissions jsonb not null default '{}'::jsonb;
alter table public.business_staff add column if not exists is_active boolean not null default true;
alter table public.business_staff add column if not exists invitation_status text not null default 'accepted';
alter table public.business_staff add column if not exists must_reset_password boolean not null default false;
alter table public.business_staff add column if not exists created_at timestamptz not null default now();
alter table public.business_staff add column if not exists updated_at timestamptz not null default now();

create unique index if not exists business_staff_business_email_uidx
  on public.business_staff (business_id, lower(email));

create index if not exists business_staff_business_idx
  on public.business_staff (business_id);

create table if not exists public.staff_permissions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.business_staff(id) on delete cascade,
  permission text not null,
  allowed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (staff_id, permission)
);

drop view if exists public.staff_profiles;

create view public.staff_profiles
with (security_invoker = true) as
select
  user_id,
  business_id,
  full_name,
  role,
  case when is_active then 'active' else 'inactive' end as status,
  must_reset_password
from public.business_staff
where user_id is not null;

-- Make PostgREST immediately recognize the updated view columns.
notify pgrst, 'reload schema';

create or replace function public.can_create_staff(target_business_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_plan text := 'basic';
  subscription_status text := 'trialing';
  active_staff_count integer := 0;
  staff_limit integer := 1;
begin
  select coalesce(plan, 'basic'), coalesce(status, 'trialing')
    into current_plan, subscription_status
  from public.business_subscriptions
  where business_id = target_business_id
  limit 1;

  if subscription_status not in ('active', 'trialing') then
    return false;
  end if;

  staff_limit := case current_plan
    when 'premium' then 2
    when 'pro' then 2
    when 'enterprise' then 4
    else 1
  end;

  select count(*)
    into active_staff_count
  from public.business_staff
  where business_id = target_business_id
    and is_active = true;

  return active_staff_count < staff_limit;
end;
$$;

revoke all on function public.can_create_staff(uuid) from public;
grant execute on function public.can_create_staff(uuid) to authenticated;

alter table public.business_staff enable row level security;
alter table public.staff_permissions enable row level security;

drop policy if exists "owners can read business staff" on public.business_staff;
create policy "owners can read business staff"
on public.business_staff
for select
to authenticated
using (
  exists (
    select 1 from public.businesses b
    where b.id = business_staff.business_id
      and b.owner_id = auth.uid()
  )
  or user_id = auth.uid()
);

drop policy if exists "owners can update business staff" on public.business_staff;
create policy "owners can update business staff"
on public.business_staff
for update
to authenticated
using (
  exists (
    select 1 from public.businesses b
    where b.id = business_staff.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses b
    where b.id = business_staff.business_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "owners can delete business staff" on public.business_staff;
create policy "owners can delete business staff"
on public.business_staff
for delete
to authenticated
using (
  exists (
    select 1 from public.businesses b
    where b.id = business_staff.business_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "staff permissions owner read" on public.staff_permissions;
create policy "staff permissions owner read"
on public.staff_permissions
for select
to authenticated
using (
  exists (
    select 1
    from public.business_staff s
    join public.businesses b on b.id = s.business_id
    where s.id = staff_permissions.staff_id
      and (b.owner_id = auth.uid() or s.user_id = auth.uid())
  )
);

commit;
