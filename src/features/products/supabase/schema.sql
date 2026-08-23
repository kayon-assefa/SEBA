-- =============================================================================
-- PRODUCTS MODULE - FULL SUPABASE MIGRATION
-- Run this whole file once in Supabase SQL editor (Dashboard > SQL Editor > New query)
-- Safe to re-run: everything uses IF NOT EXISTS / OR REPLACE where possible.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. CATEGORIES (feature 23)
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  name text not null,
  created_at timestamptz default now(),
  unique (business_id, name)
);

-- ---------------------------------------------------------------------------
-- 2. SUPPLIERS (feature 27 in your numbering / "supplier linking" #47)
-- ---------------------------------------------------------------------------
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  name text not null,
  contact_phone text,
  contact_email text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 3. TAGS (feature 39)
-- ---------------------------------------------------------------------------
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  name text not null,
  unique (business_id, name)
);

create table if not exists product_tags (
  product_id uuid not null,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- 4. PRODUCTS - extend existing table with new columns (safe additive migration)
-- ---------------------------------------------------------------------------
alter table products add column if not exists sku text;
alter table products add column if not exists barcode text;
alter table products add column if not exists unit text default 'pcs';
alter table products add column if not exists cost_price numeric(12,2);
alter table products add column if not exists sale_price numeric(12,2); -- feature 38, "coming soon" in UI, column ready for later
alter table products add column if not exists tax_rate numeric(5,2) default 0;
alter table products add column if not exists currency text default 'ETB';
alter table products add column if not exists low_stock_threshold integer default 5;
alter table products add column if not exists is_archived boolean default false;
alter table products add column if not exists is_favorite boolean default false;
alter table products add column if not exists category_id uuid references categories(id) on delete set null;
alter table products add column if not exists supplier_id uuid references suppliers(id) on delete set null;
alter table products add column if not exists approval_status text default 'approved' check (approval_status in ('pending','approved','rejected'));
alter table products add column if not exists name_translations jsonb default '{}'::jsonb;
alter table products add column if not exists is_public boolean default false;
alter table products add column if not exists public_slug text unique;
alter table products add column if not exists view_count integer default 0;

create index if not exists idx_products_business_id on products (business_id);
create index if not exists idx_products_category_id on products (category_id);
create index if not exists idx_products_low_stock on products (business_id, stock);

-- ---------------------------------------------------------------------------
-- 5. PRODUCT VARIANTS (feature 35)
-- ---------------------------------------------------------------------------
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,        -- e.g. "Size", "Color"
  value text not null,       -- e.g. "Large", "Red"
  price_override numeric(12,2),
  stock integer not null default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 6. PRODUCT IMAGES (feature 34 - multiple images / gallery)
-- ---------------------------------------------------------------------------
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 7. STOCK HISTORY (feature 33)
-- ---------------------------------------------------------------------------
create table if not exists stock_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  business_id uuid not null,
  change integer not null,          -- positive = added, negative = removed
  previous_stock integer not null,
  new_stock integer not null,
  reason text,
  created_by uuid,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 8. ACTIVITY LOG (feature 43)
-- ---------------------------------------------------------------------------
create table if not exists product_activity_log (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  business_id uuid not null,
  action text not null,   -- created | updated | deleted | archived | restored | approved | rejected
  actor_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 9. NOTIFICATIONS (feature 57 - low stock alerts, in-app)
-- ---------------------------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  type text not null,
  title text not null,
  body text,
  product_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Trigger: auto-create a notification whenever stock drops to/below threshold
create or replace function fn_notify_low_stock()
returns trigger as $$
begin
  if new.stock <= coalesce(new.low_stock_threshold, 5)
     and (old.stock is null or old.stock > coalesce(new.low_stock_threshold, 5)) then
    insert into notifications (business_id, type, title, body, product_id)
    values (
      new.business_id,
      'low_stock',
      'Low stock: ' || new.name,
      new.name || ' has ' || new.stock || ' ' || coalesce(new.unit, 'pcs') || ' left.',
      new.id
    );
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_notify_low_stock on products;
create trigger trg_notify_low_stock
  after insert or update of stock on products
  for each row execute function fn_notify_low_stock();

-- ---------------------------------------------------------------------------
-- 10. FAVORITES already covered by products.is_favorite (feature 54)
-- ---------------------------------------------------------------------------

-- View counter used by productService.recordView() (feature 53 - analytics)
create or replace function increment_product_view(product_id uuid)
returns void as $$
  update products set view_count = coalesce(view_count, 0) + 1 where id = product_id;
$$ language sql security definer;

-- ---------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (fixes the "security" ask - locks every new table
--     down to rows belonging to the caller's business, same pattern the
--     products table already uses)
-- ---------------------------------------------------------------------------
alter table categories enable row level security;
alter table suppliers enable row level security;
alter table tags enable row level security;
alter table product_tags enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table stock_history enable row level security;
alter table product_activity_log enable row level security;
alter table notifications enable row level security;

-- Helper: assumes a `business_members` table mapping auth.uid() -> business_id.
-- If your project already has an equivalent helper function, use that instead
-- of the inline subqueries below.
create or replace function fn_user_business_ids()
returns setof uuid as $$
  select business_id from business_members where user_id = auth.uid();
$$ language sql stable security definer;

create policy "categories_business_isolation" on categories
  for all using (business_id in (select fn_user_business_ids()))
  with check (business_id in (select fn_user_business_ids()));

create policy "suppliers_business_isolation" on suppliers
  for all using (business_id in (select fn_user_business_ids()))
  with check (business_id in (select fn_user_business_ids()));

create policy "tags_business_isolation" on tags
  for all using (business_id in (select fn_user_business_ids()))
  with check (business_id in (select fn_user_business_ids()));

create policy "product_tags_business_isolation" on product_tags
  for all using (
    product_id in (select id from products where business_id in (select fn_user_business_ids()))
  )
  with check (
    product_id in (select id from products where business_id in (select fn_user_business_ids()))
  );

create policy "product_variants_business_isolation" on product_variants
  for all using (
    product_id in (select id from products where business_id in (select fn_user_business_ids()))
  )
  with check (
    product_id in (select id from products where business_id in (select fn_user_business_ids()))
  );

create policy "product_images_business_isolation" on product_images
  for all using (
    product_id in (select id from products where business_id in (select fn_user_business_ids()))
  )
  with check (
    product_id in (select id from products where business_id in (select fn_user_business_ids()))
  );

create policy "stock_history_business_isolation" on stock_history
  for all using (business_id in (select fn_user_business_ids()))
  with check (business_id in (select fn_user_business_ids()));

create policy "activity_log_business_isolation" on product_activity_log
  for all using (business_id in (select fn_user_business_ids()))
  with check (business_id in (select fn_user_business_ids()));

create policy "notifications_business_isolation" on notifications
  for all using (business_id in (select fn_user_business_ids()))
  with check (business_id in (select fn_user_business_ids()));

-- Public catalog read-only policy (feature 50) - only rows explicitly marked public
drop policy if exists "products_public_read" on products;
create policy "products_public_read" on products
  for select using (is_public = true and is_archived = false);

-- ---------------------------------------------------------------------------
-- 12. STORAGE BUCKET for product images (feature 24)
-- Run once - safe if it already exists.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy if not exists "product_images_read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy if not exists "product_images_write" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy if not exists "product_images_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- =============================================================================
-- DONE. Notes:
-- - `fn_user_business_ids()` assumes a `business_members(user_id, business_id)`
--   table exists for role/multi-user setups. If your app instead stores a
--   single business per auth user, replace the subquery with whatever your
--   existing `getActiveBusinessId()` logic uses on the server side.
-- - Approval workflow (#59) and role gating (#58) are enforced in the app
--   layer (see lib/permissions.ts) - add a `role` column to your
--   `business_members`/profile table ('owner' | 'staff') if you don't have one:
--   alter table business_members add column if not exists role text default 'staff';
-- =============================================================================
