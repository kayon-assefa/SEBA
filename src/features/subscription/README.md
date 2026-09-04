# SEBA Subscription MVP

## What this feature contains

- `/subscription` page
- 14-day trial display
- Basic / Pro / Enterprise plans
- 250 / 450 / 600 ETB monthly pricing
- current plan/status
- plan comparison
- billing section
- payment history
- invoice view
- cancellation and reactivation
- secure AfriPay hand-off through a Supabase Edge Function
- Supabase RLS and RPCs
- no client-side "payment succeeded" logic

## 1. Copy the feature

Extract this folder into:

`src/features/subscription`

Your final files should look like:

`src/features/subscription/index.ts`
`src/features/subscription/pages/SubscriptionPage.tsx`
`src/features/subscription/service.ts`
`src/features/subscription/types.ts`

The feature imports your existing project files:

`src/lib/supabase`
`src/lib/business`

Those already match the settings feature you supplied.

## 2. Run the SQL

Open Supabase Dashboard → SQL Editor.

Run:

`supabase/subscription-mvp.sql`

This migration creates:

- `business_subscriptions`
- `subscription_payments`
- `subscription_invoices`
- RLS policies
- cancellation RPC
- reactivation RPC
- 14-day trial rows for existing businesses

It also migrates the old settings plan name `premium` to `pro`.

## 3. Add the route

In your `AppRouter.tsx`, import:

```tsx
import { SubscriptionPage } from "../../features/subscription";
```

Then add the route that matches your existing dashboard route structure:

```tsx
<Route path="/subscription" element={<SubscriptionPage />} />
```

If SEBA is mounted under `/seba`, use your existing router basename/prefix rather than duplicating `/seba` inside the feature.

## 4. Important: AfriPay

The page intentionally does NOT activate a plan from the browser.

When a customer chooses a plan, it calls:

`supabase.functions.invoke("create-afripay-payment")`

Your Edge Function must:

1. authenticate the user
2. verify the business belongs to that user
3. validate the requested plan and server-side price
4. create the AfriPay transaction
5. create a `subscription_payments` row with `pending`
6. return `{ checkout_url, payment_id }`

After AfriPay payment, your webhook/server code must:

1. verify the webhook signature/authenticity
2. verify the transaction with AfriPay
3. update the payment to `paid` or `failed`
4. activate/update `business_subscriptions`
5. create the invoice after confirmed payment

Do not put AfriPay secret keys in Vite/frontend environment variables.

The exact AfriPay API endpoint, headers, signature method and payload are not included here because they depend on the AfriPay account/API credentials you have. Do not invent those values.

## 5. Current MVP limitation

Usage cards deliberately show `—` for Products and Appointments because the supplied settings reference did not establish the final table names for those records.

Staff usage can be wired next using the existing `business_staff` table already used by your settings feature.

## 6. Test order

First test the page and database without payment:

1. run SQL
2. log in as a business owner
3. open `/subscription`
4. confirm the trial appears
5. confirm the three plans
6. confirm billing history is empty
7. test cancellation
8. test reactivation

Then wire AfriPay Edge Functions and test:

`pending → paid → active`

and:

`pending → failed → current plan unchanged`

## 7. Existing settings compatibility

Your settings reference used:

- `business_subscriptions`
- `premium`
- 250 / 380 / 420 pricing

This MVP uses the requested:

- `basic`
- `pro`
- `enterprise`
- 250 / 450 / 600 pricing

The SQL migration converts existing `premium` subscriptions to `pro` before enforcing the new plan constraint.
