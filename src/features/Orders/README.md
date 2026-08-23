# SEBA Orders — Updated Module

This is your Orders page/component folder with the requested UI
changes and features added. It's built to drop into your existing
app (it expects `../../../lib/supabase` and `../../../lib/business`
to already exist there, same as your original code).

## 1. Install the one new package

From your project root:

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

That's the only new dependency — everything else (`lucide-react`,
`react-hot-toast`) was already in your project.

## 2. Run the database migration

Open your Supabase project → **SQL Editor** → **New query**, paste
the contents of `sql/migration.sql`, and click **Run**.

It's safe to run more than once. It adds:

- `products.stock_quantity`, `products.track_stock` — for the
  out-of-stock product picker
- `businesses.slug` — used to build the receipt link
  `seba.com/{slug}/order/{id}`, auto-filled from your business name
- `orders.order_number`, `.delivery_type`, `.delivery_address`,
  `.scheduled_at`, `.estimated_ready_at`, `.discount`, `.tax`,
  `.amount_paid`, `.telegram_chat_id`, `.status_history`
- a trigger that auto-generates a short `order_number` like
  `260821-0007` on every new order
- adds `orders` to the realtime publication (for live updates)

## 3. Drop in the files

Copy this whole `Orders` folder over your existing one (or merge
file by file if you've customized things). Then restart your dev
server.

## 4. Where to plug in real Telegram sending

I left the Telegram button and the "notify customer on Telegram"
toggle in place as **placeholders** since you said you'll wire that
up later. Right now:

- The order form's Telegram toggle is disabled with a "Coming soon" pill
- The receipt's **Send on Telegram** button shows an alert instead
  of actually sending

When you're ready, you'll need a Telegram bot token + each
customer's `chat_id` (they have to message your bot first — Telegram
doesn't allow bots to message users who haven't started a
conversation). At that point:

1. Store `telegram_chat_id` on the order (the column's already there)
2. Replace the `handleTelegramSend` function in
   `components/OrderReceiptModal.tsx` with a call to your backend,
   which calls the Telegram Bot API's `sendMessage` (and optionally
   `sendPhoto` for the receipt image)

## What's included

**Product stock in the order form** — the product dropdown reads
`stock_quantity` / `track_stock` from `products`. Anything out of
stock shows greyed out (grayscale) and can't be selected.

**Order receipt card** — click any order (or create a new one) to
see an Apple-style receipt: creamy background, status badge, a
circular QR code with a dark-orange ring and your shop's initial in
the center, the order ID next to it, itemized breakdown with
discount/tax/total, a working **Print** button (opens a clean print
window), and a **Send on Telegram** button (placeholder for now).
The QR encodes `seba.com/{your-slug}/order/{order-id}`.

**Views** — Table / Board (kanban, drag cards between statuses) /
Cards, switchable from the top of the page.

**Filters** — search, status, payment status, date (including a
custom range), min/max total, sort, all shown as clearable chips.

**Bulk actions** — select multiple orders, bulk status change or
delete.

**Order drawer** — status timeline stepper, delivery/pickup info,
full totals breakdown, status history, and buttons for View Receipt,
Edit Items, Duplicate, Refund, Cancel, Delete.

**Other additions**: sticky table header, skeleton loading state,
better empty state, sortable columns, row highlight on new orders,
recent-customer autofill in the order form, keyboard shortcuts
(`n` = new order, `/` = focus search), and live updates via Supabase
Realtime so orders refresh automatically when changed elsewhere.

## What I left out (on purpose, from your "except" list)

- Avatar/initials circles on rows, dark mode
- Email receipts, CSV/Excel export, PDF invoice export, sales
  reports, packing-slip printing, assigning orders to staff

If you want any of those added later, just ask — the structure
(service layer + typed models) makes them straightforward to bolt
on.

## A couple of honest notes

- I don't have your actual `lib/supabase.ts` / `lib/business.ts` or
  live database, so I built this against the schema your original
  code implied, plus the migration above. If a column name doesn't
  match your real tables, you'll see a Supabase error naming the
  column — easiest fix is either renaming the column in the SQL file
  or in `services/orders.service.ts`.
- The QR "circular" look renders the code as dots inside a
  dark-orange ring with a logo badge in the center — that's the
  scannable-safe way to do a "circle QR" (fully clipping the QR data
  itself into a circle breaks most scanners). It uses error
  correction level H, which tolerates the center logo.
