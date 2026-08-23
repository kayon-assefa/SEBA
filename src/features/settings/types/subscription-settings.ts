export type SubscriptionPlan = "basic" | "premium" | "enterprise";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "expired";

export type Subscription = {
  id?: string;
  business_id?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  price?: number | null;
  currency?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  next_billing_date?: string | null;
  billing_email?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SubscriptionPlanInfo = {
  id: SubscriptionPlan;
  name: string;
  price: number;
  currency: string;
  description: string;
  staff_limit: number | null;
  features: string[];
};

export const SUBSCRIPTION_PLANS: SubscriptionPlanInfo[] = [
  { id: "basic", name: "Basic", price: 250, currency: "ETB", description: "Core business tools.", staff_limit: 3, features: ["Business page", "Bookings", "Shop"] },
  { id: "premium", name: "Premium", price: 380, currency: "ETB", description: "More automation and growth tools.", staff_limit: 10, features: ["Everything in Basic", "Advanced notifications", "More staff"] },
  { id: "enterprise", name: "Enterprise", price: 420, currency: "ETB", description: "Full multi-location business control.", staff_limit: null, features: ["Everything in Premium", "Branches", "Enterprise controls"] },
];

export type Invoice = {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  invoice_date: string;
  billing_period_start?: string;
  billing_period_end?: string;
  invoice_url?: string | null;
};

export type ChangePlanInput = { plan: SubscriptionPlan };
