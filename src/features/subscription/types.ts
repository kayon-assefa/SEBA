export type SubscriptionPlan = "basic" | "pro" | "enterprise";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "payment_pending"
  | "past_due"
  | "payment_failed"
  | "cancelled"
  | "expired";

export type Subscription = {
  id: string;
  business_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  price: number;
  currency: string;
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  next_billing_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  business_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  provider: string;
  provider_reference: string | null;
  status: "pending" | "paid" | "failed";
  paid_at: string | null;
  created_at: string;
};

export type Invoice = {
  id: string;
  business_id: string;
  subscription_id: string | null;
  payment_id: string | null;
  invoice_number: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  billing_period_start: string | null;
  billing_period_end: string | null;
  issued_at: string;
};

export type Plan = {
  id: SubscriptionPlan;
  name: string;
  price: number;
  description: string;
  staffLimit: number;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 250,
    description: "For small businesses",
    staffLimit: 1,
    features: [
      "Public business page",
      "Appointment system",
      "Shop",
      "Basic analytics",
      "1 staff account",
      "Basic customization",
      "Basic SEO",
      "SEBA branding",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 450,
    description: "For growing businesses",
    staffLimit: 3,
    features: [
      "Everything in Basic",
      "3 staff accounts",
      "Advanced analytics",
      "Advanced SEO",
      "Advanced customization",
      "More business controls",
      "Reduced SEBA branding",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 600,
    description: "For larger businesses",
    staffLimit: 6,
    features: [
      "Everything in Pro",
      "6 staff accounts",
      "Multiple branches",
      "Branch management",
      "Advanced permissions",
      "Enterprise controls",
    ],
  },
];

export function getPlan(plan: SubscriptionPlan) {
  return PLANS.find((item) => item.id === plan) ?? PLANS[0];
}
