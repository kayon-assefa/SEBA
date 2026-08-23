# Products Module — Upgrade Notes

This replaces your existing `products/` folder. It keeps your existing file
layout (`types/`, `services/`, `components/`, `pages/`) and adds
`hooks/`, `utils/`, and `supabase/`.

---

## 1. Install the new dependency

Only one new package is needed, for the QR-code print labels:

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

Everything else (CSV export, offline sync, filters, etc.) uses packages
you already have (`react-hot-toast`, `lucide-react`, `@supabase/supabase-js`).

---

## 2. Run the SQL migration

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/schema.sql` and run it.
3. It's safe to re-run — every statement uses `if not exists` / `or replace`.

**Before you run it**, know that it assumes a `business_members` table
shaped like:

```sql
business_members (user_id uuid, business_id uuid, role text)
```

used for the role-based permissions feature (owners vs. staff) and for
locking down the new tables with row-level security. If you don't have
this table yet:

```sql
create table if not exists business_members (
  user_id uuid not null references auth.users(id),
  business_id uuid not null,
  role text not null default 'staff' check (role in ('owner','staff')),
  primary key (user_id, business_id)
);
```

Populate it with your existing owners (`role = 'owner'`) so approvals,
deletes, and category management aren't locked out for everyone.

The migration also creates a public `product-images` storage bucket for
the new image upload feature, and a Postgres trigger that writes a
row to `notifications` automatically whenever a product's stock drops to
or below its low-stock threshold.

---

## 3. Drop in the files

Copy everything in this zip over your current `products/` folder. Nothing
outside `products/` is touched — it still imports from your existing
`../../../lib/supabase` and `../../../lib/business`, so no other part of
your app needs to change.

If you want the public catalog page (`pages/PublicCatalog.tsx`), wire it
into your router at something like:

```
/catalog/:slug  ->  <PublicCatalog slug={params.slug} />
```

---

## 4. Bugs fixed

- **Edit/Delete didn't work.** `ProductTable` received `onEdit`/`onDelete`
  props but discarded them (`void onEdit; void onDelete;`) — there was no
  way to edit or delete a product from the table. Both are now wired to
  real buttons on each row.
- **Add/Edit modal was missing fields.** It only captured
  name/description/price/stock, so category, image, and status could
  never be set when adding a product even though the database supported
  them. The form now covers every field.
- **Dead code removed.** The old standalone `ProductForm.tsx` component
  wasn't used anywhere; it's been replaced with a real, wired-up form.
- **Broken images.** `<img>` tags had no `alt` text and no fallback —
  a product with no image showed a broken-image icon. Both row and grid
  views now show a placeholder instead.

## 5. Security hardening

- Every read/write is still scoped by `business_id` (as before), and the
  new tables (categories, suppliers, tags, variants, stock history,
  activity log, notifications) all ship with row-level security policies
  in `schema.sql` so one business can never see another's data.
- Form input is now length-capped and trimmed server-side (in
  `product.service.ts`), not just in the UI, so a malicious or malformed
  request straight to Supabase can't stuff an oversized `description`
  into a row.
- Image URLs are validated; direct file uploads are checked for file type
  and a 5MB size limit before they ever reach storage.
- Delete is a soft-delete (archive) by default and gated to owners for
  the permanent version — a compromised staff account can no longer wipe
  your catalog outright.
- The public catalog feature only ever exposes rows a business explicitly
  marks `is_public = true`; everything else stays behind the normal
  authenticated RLS policy.

## 6. "Coming soon" items (as requested)

These are visible in the UI but intentionally disabled, not half-built:

- **Dark mode** (#16) — toggle is in the header, disabled.
- **CSV import** (#27) — button is next to CSV export, disabled.
- **Sale price** (#38) — field is in the Add/Edit form, disabled; the
  `sale_price` database column already exists for when it's built.

## 7. Notes on a few features that need your own setup

- **Email/push for low-stock alerts (#57):** the in-app notification
  (bell icon, real-time) works out of the box via the SQL trigger. Actual
  email or push delivery needs a Supabase Edge Function wired to an email
  provider (Resend, SendGrid, etc.) with your own API key — that's a
  follow-up once you tell me which provider you want.
- **Sales analytics (#53):** view counts work now. Sales counts need to
  be linked to your orders table if/when one exists.
- **Multi-language (#51):** the `name_translations` jsonb column is ready
  on the `products` table; the form only edits the default language for
  now — say the word if you want a language-tab UI added on top.
