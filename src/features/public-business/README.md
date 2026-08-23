# SEBA Public Business MVP

This feature contains the public business page, four visual templates, public appointment booking, and public shop/cart/checkout UI.

## Template mapping

- 1 Modern -> `modern`
- 2 Elegant -> `editorial`
- 3 Minimal -> `minimal`
- 4 Creative -> `bold`

## AppRouter routes

Add these imports:

```tsx
import { PublicBusinessPage } from "../../features/public-business/components/PublicBusinessPage";
import { PublicAppointmentPage } from "../../features/public-business/appointments/PublicAppointmentPage";
import { PublicShopPage } from "../../features/public-business/shop/PublicShopPage";
```

Then add these routes before the `*` route:

```tsx
{
  path: "/:username/book",
  element: <PublicAppointmentPage />,
},
{
  path: "/:username/shop",
  element: <PublicShopPage />,
},
{
  path: "/:username",
  element: <PublicBusinessPage />,
},
```

## Database contract used by the public page

Existing tables used:

- `businesses`
- `business_settings`
- `business_state`
- `business_themes`
- `business_working_hours`
- `services`
- `products`

Optional tables queried without crashing the page:

- `appointment_fields`
- `staff`

The appointment and order submitters use a small set of fallback payload shapes because the exact `appointments` and `orders` schemas were not included with the supplied public-business package. If your schemas use different column names, update the payloads in the corresponding page rather than changing the public business data contract.

## Important

Working hours are displayed only. The public page does not use timezone/current time to decide whether the business is open. Temporary closure and publishing state are database-driven.
