# SEBA Staff — README

## Setup
1. **Run `sql/seba_staff_migration.sql` in the Supabase SQL editor first.**
   Section 0 of that file is the most important part this round — see below.
2. Drop this `staff/` folder into your app next to `features/` and wire up
   routing to `StaffLayout` (see `index.ts`).
3. No new npm packages required — QR scanning uses the browser's native
   `BarcodeDetector`, icons are hand-rolled SVG, charts are a small custom
   component.

## This round's fixes (based on your feedback)

### The "row-level security policy" and "violates constraint" errors
This was the big one, and it explained most of what felt broken across the
whole app (orders/customers refusing to save, appointments throwing a
constraint error, "can't change my profile name", the dashboard sometimes
showing nothing). **Root cause:** `appointments`, `orders`, `customers`, and
`business_staff` almost certainly only had RLS policies written for the
business owner's own login — a staff login (`business_staff` row) is a
*different* Supabase user with no ownership relationship to those rows, so
Postgres was correctly refusing every read/write from a staff account.
`sql/seba_staff_migration.sql` section 0 adds policies that grant active
staff members full access to their own business's appointments, orders, and
customers, read access to the bookable `staff`/`services`/`products` tables,
and the ability to update their own `business_staff` row (name, language).
**You need to run this SQL for staff logins to work at all** — no amount of
app-code changes fixes a database permission error.

### Add Appointment / Add Order now use real dropdowns, not free text
- **Service** and **Staff** are now `<select>` dropdowns pulled live from
  your actual `services` and `staff` tables — nothing to type. If either
  list is empty, the form clearly says "No services/staff available" and
  won't let you submit, instead of silently accepting garbage.
- **Order items** work the same way: pick a product from your `products`
  table, set a quantity, hit the small `+` — no typing item names or
  prices by hand.
- **Phone number autosuggest**: typing a phone number on either form shows
  a live dropdown of matching existing customers; picking one fills in
  their saved name too.
- **Time** is now a 30-minute-interval dropdown instead of a raw time input.
- **Ethiopian calendar**: the date field now shows the equivalent Ethiopian
  date underneath it (`utils/ethiopianCalendar.ts`) as a reference — the
  actual picker stays Gregorian since that's what's stored in the database.
- The appointment write now matches the owner app's exact pattern (writes
  both `services`/`service` and `staff_members`/`staff` together — see
  `services/staffData.ts` `createAppointment`), which is what the
  "no value in column staff… violation" error was about.

### Scan page
- Camera scanning is unchanged in mechanism (native `BarcodeDetector`) but
  the manual-code fallback is more prominent since browser QR support from
  live video is inconsistent across devices — if the camera won't read a
  code, typing/pasting it works immediately.
- Scan results now have the **same action buttons as the real page**
  (Confirm / Complete / Cancel for appointments; status buttons for
  orders) plus an **"Appointments" / "Orders" button that takes you
  straight to that page** — no more dead end after a successful scan.

### Visual / UX
- **Sidebar is now neutral (white in light mode, near-black in dark
  mode)** with red used only as an accent on the active nav item — not a
  solid red panel. The logo mark box is gone; it's just the "SEBA" wordmark.
- **Dark mode redone** with a proper neutral charcoal palette (closer to
  Linear/Vercel-style dark UIs) instead of a dark-red tint.
- **Dashboard chart** redrawn with a gradient fill, rounded bars, and
  always-visible value labels instead of hover-only.
- **Appointments "Calendar" view no longer freezes on phone-size screens.**
  It was a fixed 7-column CSS grid forcing horizontal scroll on narrow
  viewports; it now stacks into a single column below 900px.
- Added a **sticky "+ Add" bar at the bottom of the screen on phones** for
  Appointments/Orders/Customers, so the add button is always reachable
  without scrolling back to the header.

## Known limitations / things I'm not 100% sure I read correctly
- "Notifications — we just only need to share notes" was hard to parse
  from the voice transcript; I left notification prefs (SMS/push) and the
  notification list as-is rather than guess wrong. Tell me plainly what you
  want there and I'll change it.
- Translations (Amharic/Tigrigna/Afaan Oromo, from the previous round)
  haven't been reviewed by a native speaker.
- The QR fix is scanner-side only, per your earlier request to keep this to
  the staff zip. If you also want me to touch the Orders feature's receipt
  QR format directly, say so and I'll include that separately.

## Files of interest
- `sql/seba_staff_migration.sql` — **run this first**, section 0 especially
- `services/staffData.ts` — `getBookableStaff`/`getBookableServices`/
  `getOrderableProducts`, `friendlyDbError` (turns raw Postgres errors into
  plain-language messages), `createAppointment`
- `components/AddEntityModals.tsx` — the three Add forms
- `utils/qr.ts` — QR resolution logic
- `utils/ethiopianCalendar.ts` — Gregorian→Ethiopian date conversion
- `i18n/` — language system (English/Amharic/Tigrigna/Afaan Oromo)
