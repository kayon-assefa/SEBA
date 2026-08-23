# Appointments module - what changed

## What's real (talks to your Supabase `appointments` table, same pattern as before)
- Full CRUD, still through `supabase.from("appointments")` with `business_id` scoping - nothing was switched to a fake/local store.
- **Conflict detection**: before every booking or reschedule, the exact staff + time window is checked against live data (client-side instantly while you're filling the form, then re-checked against the database right before saving so two people can't double-book the same second).
- **Suggested times**: when a slot is taken, real open slots are computed from actual bookings that day (9:00-19:00, 15 min steps) and shown as clickable chips.
- **Waitlist**: if you book anyway on a taken slot, the appointment is saved with status `Waitlisted` and does not block that time for anyone else.
- **Customers auto-sync**: booking an appointment finds-or-creates a row in a `customers` table (matched by phone) and bumps their visit count / total spent / last visit - see `sql/migration.sql`. Nothing else on a Customers page was built (you asked to save that for next time), but the data will already be there when you do.
- **Auto no-show flagging**: on page load, any Pending/Confirmed appointment whose end time passed more than 30 minutes ago is flipped to `No-show` in the database.
- Recurring appointments, multi-service, multi-staff, buffer-aware conflict checks, deposits/payment status, drag-to-reschedule (calendar view), drag-to-change-status (kanban view) - all persisted for real.

## What's simulated, and why
Sending an actual SMS / WhatsApp message / email requires a paid provider (Twilio, WhatsApp Business API, SendGrid...) called from a **server**, because the API keys can never live in browser code. There's no backend endpoint for that here, so `services/notification.service.ts` logs what *would* be sent (to `localStorage`, key `appointments_notification_log`) and shows a toast saying it's simulated. The scheduling/dedupe logic around it is real - when you're ready, drop your API call into the single `sendViaProvider()` function in that file and it's live.

## Coming soon (intentionally disabled in the UI)
- **Discount codes** - the input is visible but disabled with a "Coming soon" badge, and the `discount_code` column exists in the DB ready for it, per your request.

## Not included (you said no)
Customer profile page, block/blacklist customer, staff working-hours settings, staff calendar, staff performance stats, CSV export, bulk actions, undo-delete, CSV import, business hours/holiday settings, service catalog management, multi-branch, role-based access, analytics dashboard.

## Before you run it
1. Run `sql/migration.sql` once in your Supabase SQL editor (safe to re-run).
2. `services/appointment.service.ts` and `services/customer.service.ts` import `../../../lib/supabase` and `../../../lib/business` - same paths the original file used, so this drops straight into your existing project.
3. If your `customers` table already exists with different column names, adjust `services/customer.service.ts` to match instead of using the migration's version.
