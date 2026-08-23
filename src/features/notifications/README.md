# SEBA Notifications module

A drop-in Notifications page that follows the exact same pattern as your
Orders/Appointments/Customers/Products modules: Supabase-backed,
`business_id`-scoped, realtime, same component/service/types/sql folder
layout, same Tailwind look (orange-600 accents, gray scale, rounded-lg
cards).

It shows one feed of everything happening in your business — new orders,
order status changes, new appointments, cancellations/no-shows, new
customers, unpaid balances, and logins — with **real** browser push
(works even with every tab closed) and **real** offline support (the page
still opens with no connection, showing your last-synced notifications).

All 30 features you approved are in this build. See the checklist at the
bottom.

---

## What's real vs. what needs one manual step

**Real, works immediately after the SQL migration:**
- The notifications feed, filters, search, grouping, mark-as-read,
  delete+undo, unread badge, settings panel.
- Auto-generated notifications for orders/appointments/customers, via
  database triggers (they fire even if nobody has the app open).
- Offline mode: cached feed, offline banner, queued actions that sync
  once you're back online, installable PWA.
- Realtime updates (new notification appears instantly while the tab is
  open), same `postgres_changes` pattern as your other modules.

**Real, but needs the one-time setup below (steps 4–6):** actual push
notifications to a closed browser. This is the part that legally cannot
work without a tiny bit of server-side plumbing — a browser can never
hold the secret key needed to send a push (same reason your
`appointments/notification.service.ts` SMS sending is simulated: real
delivery needs a server-side secret). The difference here is I've built
that server side for you (a Supabase Edge Function), so it's a deploy +
two commands, not a "drop your API key in later."

---

## 1. Copy the files in

Drop the `notifications/` folder into your project exactly like the
other module zips — same `../../../lib/supabase` and
`../../../lib/business` import paths, so it's a straight drop-in:

```
src/features/Notifications/
  types/notification.ts
  services/notification.service.ts
  services/push.service.ts
  hooks/useNotifications.tsx
  hooks/useOnlineStatus.ts
  hooks/usePushSubscription.ts
  components/Sidebar.tsx
  components/NotificationBell.tsx
  components/NotificationItem.tsx
  components/NotificationFilters.tsx
  components/NotificationSettingsPanel.tsx
  components/NotificationSkeleton.tsx
  components/EmptyState.tsx
  components/OfflineBanner.tsx
  pages/Notifications.tsx
  sql/migration.sql
```

And these go at your **app's root**, not inside `src/features/`:
```
public/sw.js
public/offline.html
public/manifest.json
supabase/functions/send-push/index.ts
```

No new npm packages are required for the app itself — everything uses
libraries your other modules already import (`react-hot-toast`,
`lucide-react`, `@supabase/supabase-js`, `react-router-dom`). If any of
those aren't installed yet:

```bash
npm install react-hot-toast lucide-react react-router-dom
```

## 2. Run the SQL migration

Same as every other module: Supabase Dashboard → SQL Editor → paste
`sql/migration.sql` → Run. Safe to re-run.

This creates `notifications`, `push_subscriptions`, `notification_settings`,
turns on Row Level Security, and adds triggers to your existing `orders`,
`appointments`, and `customers` tables so notifications generate
themselves.

**One check:** the RLS policies assume the same ownership model your app
already uses (`businesses.id == owner's auth.uid()`, staff linked via
`staff_profiles(user_id, business_id, status)`). If your `staff_profiles`
table doesn't exist yet, the policies still work — they just fall back to
the "owner only" half.

## 3. Wire up the sidebar / login notification (2 tiny edits)

**a. Notifications route** — add to your router, next to your other pages:
```tsx
import Notifications from "./features/Notifications/pages/Notifications";
// ...
<Route path="/notifications" element={<Notifications />} />
```

**b. Sidebar** — if you already have a real Sidebar/Shell component, just
add one nav item to it (see `components/Sidebar.tsx` for the exact
markup/icon to copy — it's already in your app's style). If you don't
have one yet, the page's own `Sidebar.tsx` renders automatically, so
there's nothing else to do.

**c. Login notifications** — a database trigger can't see Supabase Auth
logins the way it can see your `orders`/`appointments` tables, so this
one is fired from the client, in your existing `AuthContext.tsx`. Add
this inside the `SIGNED_IN` branch of your `onAuthStateChange` handler:
```tsx
import { notificationService } from "../../Notifications/services/notification.service";
// ...
if (_event === "SIGNED_IN" && nextSession?.user) {
  const businessId = result.accountType === "staff"
    ? result.staff!.business_id
    : nextSession.user.id;
  void notificationService.recordLogin({
    businessId,
    who: nextSession.user.email ?? "Someone",
  });
}
```
(Didn't touch your actual `AuthContext.tsx` file since you only asked
for the Notifications zip — same approach the Customers module README
used for its Orders/Appointments hookup.)

## 4. Generate your VAPID keys (for real push)

Web Push needs a keypair. One command, no account/signup needed:

```bash
npx web-push generate-vapid-keys
```

This prints a public and private key. Add the **public** one to your
frontend env file:
```
# .env
VITE_VAPID_PUBLIC_KEY=BN...your public key...
```

Keep the **private** key out of your frontend entirely — it goes in step 5.

## 5. Deploy the send-push Edge Function

```bash
supabase functions deploy send-push

supabase secrets set \
  VAPID_PUBLIC_KEY="BN...same public key..." \
  VAPID_PRIVATE_KEY="...the private key from step 4..." \
  VAPID_SUBJECT="mailto:you@yourdomain.com"
```

## 6. Connect the trigger: Database Webhook

Dashboard → Database → Webhooks → **Create a new webhook**:
- Table: `notifications`
- Events: `INSERT`
- Type: Supabase Edge Function
- Function: `send-push`

That's it — from now on, every row inserted into `notifications` (by any
of the triggers, or by the login call) automatically fires `send-push`,
which sends a real push to every subscribed device for that business,
respecting each person's category mutes and quiet hours.

## 7. (Optional) Daily unpaid-balance digest

The migration creates `seba_run_unpaid_digest()`, which inserts *one*
notification per business per day instead of one per unpaid
order/appointment. To run it automatically, enable the `pg_cron`
extension (Dashboard → Database → Extensions) and run once:
```sql
select cron.schedule('seba-unpaid-digest', '0 8 * * *', 'select seba_run_unpaid_digest();');
```
Without this step, unpaid-balance notifications simply won't fire — no
migration to undo, just skip it if you don't want the digest yet.

## 8. Icons

`manifest.json` and `sw.js` reference `/icons/icon-192.png`,
`/icons/icon-512.png`, and `/icons/badge-72.png`. Drop your own logo in
at those sizes/paths (any PNG works — these are just placeholders
pointing at paths that don't exist yet, nothing will break if you skip
this, push notifications will just use the browser's default icon).

---

## About the QR code

You mentioned wanting a QR code in the zip — I skipped it because a QR
code needs a real URL to point at, and this only becomes a live URL once
you've deployed it (steps above). If you want one for, say, printing next
to a register so staff can scan it to open `/notifications` on their
phone, generate it after deploying, pointed at
`https://yourdomain.com/notifications` — any free QR generator works,
or say the word and I'll build one into this page.

---

## Security, specifically

- **RLS on all three new tables** — a business can only ever read/write
  its own notifications, subscriptions, and settings (policy detail in
  `sql/migration.sql` step 4).
- **Notifications are only ever inserted server-side** — by
  `SECURITY DEFINER` triggers or the Edge Function's service-role
  client. There's deliberately no client-side insert policy, so a
  compromised browser session can't forge a notification for another
  business.
- **Push subscriptions are tied to `user_id` + `business_id`**, and
  `pushService.unsubscribe()` removes the row — call it from your
  logout flow if you want subscriptions cleared when someone signs out.
- **The VAPID private key never leaves the Edge Function.** The
  frontend only ever holds the public key (`VITE_VAPID_PUBLIC_KEY`),
  which is safe to expose by design.
- **Category mutes and quiet hours are enforced server-side**, in
  `send-push`, not just hidden in the UI — so muting a category actually
  stops the push, not just the badge.
- **Rate limiting**: triggers only fire on genuine `INSERT`/status-change
  events on tables you already control inserts into, so there's no path
  for a loop to spam notifications the way a client-side polling loop
  could.

---

## Feature checklist (all 30, as approved)

**Core feed:** sidebar nav item + unread badge · notifications table with
RLS + realtime · auto-generated from orders/appointments/customers/auth ·
grouped by day · filter tabs · mark as read / mark all read ·
click-to-navigate · delete with undo · search · empty states + skeletons

**Push:** permission explainer + native prompt · real Web Push via
Service Worker + VAPID · Edge Function sender · click focuses/opens the
right page · per-category push toggles · quiet hours · badge count

**Offline / PWA:** app-shell caching · offline banner · offline action
queue that syncs on reconnect · installable manifest · cached last-known
list

**Security:** RLS on all tables · subscriptions tied to user+business,
revocable · service-role-only Edge Function · trigger-based inserts
(no spam path)

**Extras:** sound toggle · in-app toast + push, deduped (same
`postgres_changes` event drives both, so you never get two pushes for
one event) · daily unpaid digest instead of per-item spam · settings
panel tying it all together
