-- Server-only challenge store for the SEBA shape CAPTCHA.
-- No client policies are created: Edge Functions use the service role.

create table if not exists public.captcha_challenges (
  id uuid primary key default gen_random_uuid(),
  correct_ids text[] not null,
  solved boolean not null default false,
  verified_token text unique,
  token_expires_at timestamptz,
  expires_at timestamptz not null,
  redeemed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists captcha_challenges_token_idx
  on public.captcha_challenges (verified_token);

alter table public.captcha_challenges enable row level security;

create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ip text not null,
  success boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists login_attempts_email_idx
  on public.login_attempts (email, created_at desc);

alter table public.login_attempts enable row level security;
