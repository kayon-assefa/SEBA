# SEBA Public Business — upgraded package

This package is the upgraded public-business feature for SEBA. It keeps the existing four templates and adds a faster public data path, subscription/page availability handling, SEO metadata, structured data, responsive mobile actions, Apple-style glass UI polish, lazy image loading, accessibility focus states, reduced-motion support, and template-specific visual behavior.

## Templates

The renderer still maps the existing template IDs exactly as before:

- `1` → `modern`
- `2` → `editorial`
- `3` → `minimal`
- `4` → `bold`

Each template remains independently designed. The shared experience layer does **not** force one visual style over every template; it supplies only common performance, accessibility, SEO and responsive behaviors.

## Important new behavior: active / paid status

The public hook now recognizes an explicitly inactive business from any of these fields when present:

- `businesses.active (when present)`
- `businesses.is_active (when present)`
- `business_settings.active`
- `business_settings.is_active`
- `business_state.active`
- `business_state.is_active`
- `business_state.page_active`

If any of those values is explicitly `false`, the page is treated as unavailable. The public unavailable screen shows the business logo/name but does not expose the business content or actions. It also avoids indexing the unavailable page.

Existing `is_published` / `page_unpublished` behavior remains supported.

## Performance changes

The old public hook loaded settings, state, theme, hours, services, products, appointment fields and staff one after another. The upgraded hook loads the independent public queries in parallel with `Promise.all`, so one slow query no longer makes every other query wait behind it.

Images in the templates use lazy loading where appropriate, and the shared public experience enables reduced-motion support and browser-native focus states.

## SEO

`PublicBusinessSeo.tsx` adds, at runtime:

- business-specific `<title>`
- meta description
- canonical URL
- `robots=index,follow` for active published pages
- `robots=noindex,nofollow` for inactive/unpublished pages
- JSON-LD `LocalBusiness` structured data
- business logo/cover image, phone, address and social profiles when available

### Important SEO note

This is client-side SEO. For the strongest possible Google indexing, the host application should eventually use SSR or prerendering for `/:username` pages. The package is already emitting the correct metadata and JSON-LD after the business record loads, but SSR/prerendering is the next level.

## Shared UI / UX upgrades

The shared experience layer adds:

- Apple-style glass/backdrop treatment
- responsive mobile quick navigation
- Book / Shop quick actions based on business type
- back-to-top control
- keyboard focus-visible states
- reduced-motion support
- lazy image rendering hints
- template-safe CSS variables
- no forced universal color palette

The selected template still controls the hero, typography, spacing rhythm, CTA composition, card language and overall visual personality.

## Selected roadmap

### Implemented / kept active

Business/profile: reviews-ready architecture, verified identity, share flow, QR-ready profile URL, announcements, FAQ/policy-ready content areas.

Appointments: available-service selection, double-booking-safe UI foundation, rescheduling/cancellation-ready flow, confirmation/reference flow, calendar-ready output, staff selection, service/staff relationship support, custom fields, waitlist-ready UX, multi-service-ready model, duration handling and booking cutoff-ready validation.

Shop: search/filter foundation, product detail/quick-view-ready UI, variants-ready model, stock-aware cart, order status foundation, delivery-ready checkout model, delivery-fee-ready calculation hook, minimum-order-ready validation, order notes, saved customer information and payment-status-safe checkout.

### Coming soon / intentionally not activated

- Business favorites/following backend
- automated reminder service
- coupon/discount backend
- real payment gateway
- full review backend
- advanced external calendar sync

No real-money payment is triggered by accidentally opening or loading the public checkout UI. Payment execution must be connected explicitly in the host application.

## Integration

Copy this folder into the existing feature path, replacing the previous `public-business` folder. Keep your existing Supabase client import path: `../../../lib/supabase`.

Routes:

```tsx
import { PublicBusinessPage } from "../../features/public-business/components/PublicBusinessPage";
import { PublicAppointmentPage } from "../../features/public-business/appointments/PublicAppointmentPage";
import { PublicShopPage } from "../../features/public-business/shop/PublicShopPage";

{ path: "/:username/book", element: <PublicAppointmentPage /> },
{ path: "/:username/shop", element: <PublicShopPage /> },
{ path: "/:username", element: <PublicBusinessPage /> },
```

## Terminal commands

From the main SEBA application (not inside this feature folder unless your app is configured that way):

```bash
npm install
npm run dev
```

For a production check:

```bash
npm run build
npm run preview
```

If your project uses pnpm or yarn, use the equivalent commands. This feature package intentionally does not add a second React/Supabase installation.

## Database compatibility

The package keeps the existing tables:

- `businesses`
- `business_settings`
- `business_state`
- `business_themes`
- `business_working_hours`
- `services`
- `products`
- optional `appointment_fields`
- optional `staff`

The package does not require a new payment provider just to render the public page.

## Files added/changed

- `components/PublicBusinessPage.tsx` — routes active pages through the template renderer and handles inactive pages.
- `components/PublicBusinessUnavailable.tsx` — branded unavailable state.
- `components/PublicBusinessSeo.tsx` — title/meta/canonical/robots/JSON-LD.
- `components/PublicTemplateExperience.tsx` — shared glass UI, mobile actions, accessibility and scroll UX.
- `hooks/usePublicBusiness.ts` — parallel public data loading and active-state detection.
- `types/publicBusiness.ts` — adds `active`.
- `templates/TemplateRenderer.tsx` — template-specific rendering with shared experience wrapper.
- template files — small glass/lazy-image refinements without collapsing the four visual identities.


## Logged-out 404 fix

The public identity lookup uses the `get_public_business(username)` SECURITY DEFINER RPC instead of directly selecting from `businesses`. This prevents Supabase RLS from hiding valid public businesses from anonymous visitors. Run `supabase/enable-anonymous-public-pages.sql` once in the Supabase SQL Editor. The migration intentionally does not reference a required `businesses.active` column; optional active flags are inspected safely from row JSON.
