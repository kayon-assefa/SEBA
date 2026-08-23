# Customers module upgrade - what changed

## The core fix (your main ask)
`services/customer.service.ts` now has `findOrCreateByIdentity()` - the one
function Orders and Appointments should call whenever someone places an
order or books an appointment. It matches **by phone first, then email**,
never by name, so:
- Someone who orders twice → one customer record, `total_orders: 2`.
- Someone who books twice → one customer record, `total_visits: 2`.
- Someone who books once and orders once → still one customer record,
  because the phone/email matched, combining both.
- Two different people who happen to share a name → stay as two separate
  customers, because their phone/email don't match.

**This zip updates the Customers module itself.** To actually wire this up,
`Orders/services/orders.service.ts` and
`Appointments/services/appointment.service.ts` need one small change each:
replace their direct `customers` table inserts with a call to
`customerService.findOrCreateByIdentity({...})`. I didn't touch those two
files since you only asked for the Customers zip - send the word and I'll
do Orders and Appointments next so the full loop is live.

## What's in this zip
- **Duplicate detector** - flags customers with the same phone/email (legacy
  data) or same name with no contact overlap, shown as a banner on the page.
- **Manual merge tool** - review a flagged pair, pick which one survives,
  merge combines visits/orders/spend/tags/notes and re-points their
  historical orders/appointments (once those tables have `customer_id` set).
- **Lifetime value, visit frequency label** (New/Occasional/Regular/Frequent/
  Inactive), tag suggestions (VIP, At-risk, New) shown as one-click chips.
- **Combined timeline** in the customer profile - orders and appointments
  merged into one list, sorted by date.
- **Notes** with author + timestamp, **last contacted** tracker, **referral
  source**, **blacklist/flag** with reason, **pin/favorite**.
- UI: avatars, sticky table header, skeleton loaders, empty state, density
  toggle, tag/segment filters, copy-to-clipboard, call/WhatsApp icons (in
  the profile card, not the table row - matches what you asked for), toast
  with Undo on delete, "n" / "/" keyboard shortcuts.

## Skipped, as you asked
CSV export, CSV import, audit log, automated backup reminder, and deposit/
prepayment enforcement are not in this build.

## Not part of this zip (belong to other modules)
- Staff working-hours settings and Orders discount codes - you asked for
  those to show as "Coming soon" badges; I'll add those when I do the
  Appointments/Orders zips, since the UI for them lives there.
- Telegram-only reminders - that's `notification.service.ts` in the
  Appointments module, not Customers. Flagging so it's not forgotten.
- A single global search bar across Customers/Orders/Appointments together
  needs to live in your app's top nav/shell, outside any one module's zip -
  the search inside this page only searches customers for now.

## Before you run it
1. Run `sql/migration.sql` once in your Supabase SQL editor (safe to re-run).
2. Files still import from `../../../lib/supabase` and
   `../../../lib/business`, same as before - drop-in replacement for your
   existing `customers/` folder.
3. `CustomerProfile.tsx` was an empty placeholder before; it's now the real
   profile content rendered inside `CustomerDrawer.tsx`.
