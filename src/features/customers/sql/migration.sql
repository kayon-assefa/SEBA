-- Customers module upgrade - run once in the Supabase SQL editor.
-- Safe to re-run: every statement uses IF NOT EXISTS.

alter table customers
  add column if not exists total_orders integer default 0,
  add column if not exists last_contacted timestamptz,
  add column if not exists referral_source text,
  add column if not exists blacklisted boolean default false,
  add column if not exists blacklist_reason text,
  add column if not exists pinned boolean default false,
  add column if not exists updated_at timestamptz,
  add column if not exists notes jsonb default '[]';

-- `notes` used to be a plain text column on some setups. If yours is
-- still text, this converts existing notes into the new jsonb format
-- (one note, authored by "You", dated today) instead of losing them.
-- Skip this block if `notes` is already jsonb.
-- alter table customers alter column notes type jsonb using (
--   case when notes is null or notes = '' then '[]'::jsonb
--   else jsonb_build_array(jsonb_build_object(
--     'id', gen_random_uuid(), 'text', notes, 'author', 'You',
--     'created_at', now()
--   )) end
-- );

create index if not exists customers_business_email_idx on customers (business_id, email);
create unique index if not exists customers_business_phone_unique on customers (business_id, phone) where phone is not null;
create unique index if not exists customers_business_email_unique on customers (business_id, email) where email is not null;

-- customer_id link columns on orders/appointments, so the merge tool can
-- re-point historical records to the surviving customer. Safe if these
-- already exist (e.g. appointments.customer_id from the earlier migration).
alter table appointments add column if not exists customer_id uuid;
alter table orders add column if not exists customer_id uuid;

create index if not exists appointments_customer_id_idx on appointments (customer_id);
create index if not exists orders_customer_id_idx on orders (customer_id);
