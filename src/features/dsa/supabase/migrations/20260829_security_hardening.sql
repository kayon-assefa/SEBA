-- supabase/migrations/20260829_security_hardening.sql
--
-- Run with: supabase db push   (or paste into the SQL editor)
--
-- Every table here defaults to RLS enabled with NO client-facing policies:
-- they are written to and read from exclusively by edge functions using
-- the service role key, which bypasses RLS by design. That's intentional
-- — none of this data (login attempts, IP blocks, password hashes,
-- passkey public keys, audit logs) should be directly queryable by an
-- authenticated user's own anon-key session.

-- ---------------------------------------------------------------------
-- Item #2/#3/#4: login attempt log + IP lockouts
-- ---------------------------------------------------------------------
create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ip text not null,
  user_agent text,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists login_attempts_email_idx on public.login_attempts (email, created_at desc);
create index if not exists login_attempts_ip_idx on public.login_attempts (ip, created_at desc);
alter table public.login_attempts enable row level security;

create table if not exists public.blocked_ips (
  ip text primary key,
  reason text,
  blocked_until timestamptz not null
);
alter table public.blocked_ips enable row level security;

-- ---------------------------------------------------------------------
-- Item #6: resend-verification-email limiter (separate from login)
-- ---------------------------------------------------------------------
create table if not exists public.resend_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ip text not null,
  created_at timestamptz not null default now()
);
create index if not exists resend_attempts_email_idx on public.resend_attempts (email, created_at desc);
create index if not exists resend_attempts_ip_idx on public.resend_attempts (ip, created_at desc);
alter table public.resend_attempts enable row level security;

-- ---------------------------------------------------------------------
-- Item #5: SEBA shape-matching CAPTCHA challenges
-- ---------------------------------------------------------------------
create table if not exists public.captcha_challenges (
  id uuid primary key default gen_random_uuid(),
  target_shape text not null,
  tiles jsonb not null,
  correct_ids text[] not null,
  solved boolean not null default false,
  verified_token text unique,
  token_expires_at timestamptz,
  expires_at timestamptz not null,
  redeemed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists captcha_challenges_token_idx on public.captcha_challenges (verified_token);
alter table public.captcha_challenges enable row level security;

-- ---------------------------------------------------------------------
-- Item #13: real, salted, one-way password reuse history
-- ---------------------------------------------------------------------
create table if not exists public.password_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  salt text not null,
  hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists password_history_user_idx on public.password_history (user_id, created_at desc);
alter table public.password_history enable row level security;

-- ---------------------------------------------------------------------
-- Features #43/#45: passkeys (WebAuthn credentials)
-- ---------------------------------------------------------------------
create table if not exists public.passkeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  device_name text,
  created_at timestamptz not null default now()
);
alter table public.passkeys enable row level security;

create table if not exists public.webauthn_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade, -- null for discoverable/login challenges
  challenge text not null,
  type text not null check (type in ('register', 'authenticate')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.webauthn_challenges enable row level security;

-- ---------------------------------------------------------------------
-- Item #30/#31/#32: staff audit log + forced reset on reactivation
-- ---------------------------------------------------------------------
create table if not exists public.staff_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id),
  staff_user_id uuid references auth.users (id),
  action text not null, -- 'created' | 'activated' | 'deactivated' | 'role_changed'
  details jsonb,
  created_at timestamptz not null default now()
);
alter table public.staff_audit_log enable row level security;

-- Adjust this block to match your actual staff_profiles schema — this
-- assumes columns user_id, status, must_reset_password (added below if
-- missing), matching auth.service.ts's expectations.
do $$
begin
  if to_regclass('public.staff_profiles') is not null then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'staff_profiles' and column_name = 'must_reset_password'
    ) then
      alter table public.staff_profiles add column must_reset_password boolean not null default false;
    end if;
  end if;
end $$;

create or replace function public.handle_staff_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'UPDATE' and old.status is distinct from new.status then
    insert into public.staff_audit_log (staff_user_id, action, details)
    values (new.user_id, 'status_changed', jsonb_build_object('from', old.status, 'to', new.status));

    -- Item #32: reactivating a previously inactive staff member forces a
    -- password reset before their next login — their old password may be
    -- stale or have been shared during the inactive window.
    if lower(coalesce(old.status, '')) <> 'active' and lower(coalesce(new.status, '')) = 'active' then
      new.must_reset_password := true;
    end if;
  end if;
  return new;
end;
$$;

do $$
begin
  if to_regclass('public.staff_profiles') is not null then
    drop trigger if exists staff_status_change_trigger on public.staff_profiles;
    create trigger staff_status_change_trigger
      before update on public.staff_profiles
      for each row execute function public.handle_staff_status_change();
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Items #15/#33/#50: session listing/revocation RPCs
--
-- auth.sessions isn't exposed via the normal REST API, so these
-- SECURITY DEFINER functions are the supported way to read/revoke a
-- user's own sessions. They're called from the login-guard edge function
-- with the service role, which passes in the already-authenticated
-- caller's own user id — never a client-supplied one.
-- ---------------------------------------------------------------------
create or replace function public.list_user_sessions(p_user_id uuid)
returns table (
  id uuid,
  user_agent text,
  ip text,
  token_hint text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = auth, public
as $$
  select
    s.id,
    s.user_agent,
    s.ip::text,
    left(s.id::text, 8) as token_hint,
    s.created_at,
    s.updated_at
  from auth.sessions s
  where s.user_id = p_user_id
  order by s.updated_at desc;
$$;

create or replace function public.revoke_user_session(p_user_id uuid, p_session_id uuid)
returns void
language sql
security definer
set search_path = auth, public
as $$
  delete from auth.sessions where id = p_session_id and user_id = p_user_id;
$$;

-- Only the service role should ever call these (edge functions use it).
revoke all on function public.list_user_sessions(uuid) from anon, authenticated;
revoke all on function public.revoke_user_session(uuid, uuid) from anon, authenticated;
