# SEBA Settings — fix pack

This replaces your `settings` feature folder with all the requested fixes and
UI polish applied. Everything keeps your existing file names, imports, and
folder structure (`src/features/settings/...`) so it drops straight in.

## How to install

1. Back up your current `src/features/settings` folder (just in case).
2. Copy every folder from this zip (`components/`, `hooks/`, `pages/`,
   `sections/`, `services/`, `types/`) into your existing
   `src/features/settings/`, overwriting the matching files.
3. In the Supabase SQL editor, run `supabase-settings-fixes-and-notifications.sql`.
   It only *adds* things (a column, tables, RLS policies) — it won't touch your
   existing data, and it's safe to re-run.
4. Restart your dev server.

## What changed

**Theme / UI**
- Background changed from stark white to a warm cream (`#FAF7F0` page,
  `#FFFDF8` cards) across the whole settings module.
- Field labels and toggle labels are now bold and a size down, per your note.
- Every "Save" button now only appears once something has actually changed
  (Profile, Language, Region, Business, Booking, Shop, Page).

**Profile (General tab)**
- Shows name + email read-only by default, with one "Edit" button.
- Editing reveals the fields and a "Save profile" button.
- Fixed the avatar not showing after upload (missing cache-busting + the
  preview wasn't reading back the saved URL).

**Business**
- Fixed phone/email/city/address showing blank — the settings row was reading
  from an empty `business_settings` row instead of falling back to the real
  data already saved on your `businesses` table. It now merges both.
- Replaced the raw latitude/longitude fields with an actual map pin preview.
- Removed the "publish/unpublish" control — a business is now published by
  default and that's enforced server-side too (`is_published` always saved as
  `true`), so it can't be toggled off from Settings.
- Kept "Temporarily closed" with a reason + a reopening date, and that date is
  now validated to be in the future.

**Booking**
- Fixed the actual bug: the "Customer information" card had no Save button at
  all, so toggling email/phone/notes requirements did nothing. It now shares
  the same dirty-aware save bar as the rest of the tab.
- "Confirmation message" is now a locked "Coming soon" field, as requested.

**Shop**
- Save button is now dirty-aware (was always visible before).
- Added a live mini-preview that reflects your selected template and colors
  from the Page tab, plus an "orders paused" banner when relevant.

**Staff**
- Fixed permissions not showing when a staff member is clicked — it was
  rendering from an empty object instead of falling back to the role's
  default permission set.
- Enforced plan-based limits in the UI: Basic = 1 staff account, Premium = 2,
  Enterprise = 4. "Create Staff" is disabled with an explanation once you hit
  the limit or if your subscription isn't active.
- When the subscription is inactive, all staff toggles show as disabled with
  a clear banner explaining why.

**Subscription**
- No longer lists every plan — shows only your current plan, trial start/end
  dates, and an "Upgrade" button that links to `/subscription`.

**Integrations**
- Removed TikTok, Facebook, Instagram, and the old Google integration.
- Left Google Calendar (connectable) and added SEBA POS as "Coming soon".

**Security**
- Consolidated everything into a single card: Change email, Change password,
  Passkey, Danger zone, and Sessions.
- "Change password" now sends a reset link by email instead of typing a new
  password directly into Settings.
- Passkey is now real WebAuthn — it triggers your device's actual Face ID /
  Touch ID / Windows Hello prompt (see `services/webauthn.ts`). The Danger
  Zone actions (pause/resume/delete business) now require a real passkey
  verification instead of a typed passphrase.
  - **Note for production:** this stores the credential ID and trusts the
    client-side assertion. For full security you should also verify the
    assertion server-side (e.g. with `@simplewebauthn/server` in a Supabase
    edge function) rather than trusting the browser alone. That backend piece
    isn't included here.

**Notifications tab (inside Settings)**
- No longer shows the old full notification form — clicking it (or the bell)
  goes straight to `/notifications`, your new dedicated page.

**Data / Branches**
- Left untouched, as requested.

## Files worth a look

- `supabase-settings-fixes-and-notifications.sql` — run this in Supabase.
- `services/business-settings.service.ts` — the businesses-table fallback fix.
- `services/webauthn.ts` — the real Face ID / Touch ID passkey flow.
- `sections/StaffSection.tsx` — plan-based staff limits + permissions fix.
