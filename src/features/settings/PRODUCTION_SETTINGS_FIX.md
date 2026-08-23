# SEBA Settings production fix

The settings code is already wired to Supabase. Run `supabase-settings-production.sql` once in the Supabase SQL Editor before using subscription dates or company-image uploads.

The migration creates `business_subscriptions`, seeds existing businesses with the 14-day trial, enables owner-only RLS, and creates the `business-assets` storage bucket.

No UI rebuild is required.
