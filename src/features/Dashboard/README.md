# SEBA Dashboard — v2 Update

Drop-in replacement for `src/features/Dashboard/`. New in this pass:

## Removed
- Search bar in the topbar — gone.
- The "Live" pulsing dot/label in the topbar — gone.
- Simulated "new booking" notification toast on load — gone.
- Estimated Revenue stat card — gone (was demo data).
- App/S logo mark in the sidebar — gone, wordmark only, sized down.

## Now real (not demo data)
`services/dashboard.service.ts` adds:
- `getBookingsCount()` — real count from `appointments` where `business_id` matches.
- `getCustomersCount()` — unique customers derived from `appointments` (by `customer_email`, falls back to `customer_name`).
- `getOrdersCount()` — real count from `orders`.
- `getUpcomingBookings()` — next 5 upcoming appointments for the Bookings widget.

All four are wrapped in try/catch and return `0` / `[]` on any failure, so a
missing table or a different column name never breaks the dashboard — it
just shows 0 until wired up. **Check the column names** (`business_id`,
`customer_name`, `customer_email`, `starts_at`, `status`) against your
actual schema and adjust the `.select()` calls if they differ.

Loyalty points in `LoyaltyCard.tsx` are now `bookingsCount × 10 + ordersCount × 15`
— shown with the formula underneath, not a hardcoded number.

## Shop / Products
`getProducts()` now selects `image_url` and `images` (falls back gracefully
if those columns don't exist yet). `ProductCard.tsx` shows the real image;
if a product has more than one image it auto-advances every 5 seconds
(pauses on hover) with dot indicators, instead of a static icon.

## Business Status
- Live/offline indicator is now a plain, unambiguous **green/red** dot +
  badge — no pulsing animation.
- Share buttons redesigned as app-icon squircles (WhatsApp/Telegram/X/Facebook)
  with brand-toned gradients, matching how share buttons look in real apps.

## New: Printable Flyer
`BusinessFlyer.tsx` — a cream/white card with soft coral/gold abstract
shapes (in the spirit of the brand kit), the business name, tagline, and a
QR code. Two actions: **Download** (saves the QR PNG) and **Print** (opens
the browser print dialog, scoped to just the flyer via the `#seba-flyer`
print rule in `dashboard-theme.css` — works as a quick "save as PDF" too,
no extra dependency needed).

## Business Hours
Replaced the small colored dot with a real iOS-style on/off switch per day
— one clear tap to toggle a day open or closed.

## Responsiveness — now the top priority
- `context/SidebarContext.tsx` (new) shares state between the topbar and
  sidebar.
- **Below `lg`** (tablet/mobile): sidebar is a true off-canvas drawer,
  opened by the hamburger icon in the topbar, closes on backdrop tap or
  link click.
- **At `lg` and above** (desktop): sidebar is a collapsible rail, same as
  before, just without the logo and with a smaller wordmark.
- Page container widened to `max-w-[1400px]` and the main bento grid now
  switches to two columns at `xl` instead of `lg`, so it doesn't feel
  cramped on common laptop widths (1280–1440px) — this was the main
  desktop-sizing complaint, should now breathe properly at typical PC
  screen widths.
- Product grid, stat row, and all cards have explicit `sm/md/lg/xl`
  breakpoints tuned for phone → tablet → laptop → wide desktop.

## Cards / color
Stat cards now use a warm cream→white gradient surface (rather than plain
frosted glass) with a colored top accent bar, so they read as visually
distinct from the glass content cards below them.

## Still true from v1
Liquid-glass surfaces, gradient-mesh hero, count-up animated numbers,
drag-to-reorder widget stack, setup checklist that hides itself once
complete, floating quick-add button, QR/share on Business Status.
