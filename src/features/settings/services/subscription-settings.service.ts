import { supabase } from "../../../lib/supabase";
import { getCurrentUser, getCurrentBusiness, getBusinessId } from "./settings.service";
import type { Subscription, SubscriptionPlan, SubscriptionStatus } from "../types/subscription-settings";
import { SUBSCRIPTION_PLANS } from "../types/subscription-settings";

const TRIAL_DAYS = 14;

function addDays(iso: string, days: number) {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function isAfterNow(iso: string | null | undefined) {
  return !!iso && new Date(iso).getTime() > Date.now();
}

export function getTrialFromAccountCreated(createdAt: string) {
  const trialStart = new Date(createdAt).toISOString();
  const trialEnd = addDays(trialStart, TRIAL_DAYS);
  return {
    trialStart,
    trialEnd,
    trialEnded: !isAfterNow(trialEnd),
  };
}

export const subscriptionSettingsService = {
  async getContext() {
    const [user, business] = await Promise.all([getCurrentUser(), getCurrentBusiness()]);
    const businessId = business?.id ?? await getBusinessId();

    let subscription: Subscription | null = null;
    let tableFound = false;

    for (const table of ["business_subscriptions", "subscriptions"]) {
      const result = await supabase
        .from(table)
        .select("*")
        .eq("business_id", businessId)
        .limit(1);

      if (!result.error) {
        tableFound = true;
        if (result.data?.[0]) subscription = result.data[0] as Subscription;
        break;
      }
    }

    const trial = getTrialFromAccountCreated(user.created_at);

    if (!subscription) {
      const plan: SubscriptionPlan = "basic";
      const status: SubscriptionStatus = trial.trialEnded ? "expired" : "trialing";
      subscription = {
        business_id: businessId,
        plan,
        status,
        price: 0,
        currency: "ETB",
        trial_start: trial.trialStart,
        trial_end: trial.trialEnd,
        start_date: trial.trialStart,
        end_date: trial.trialEnd,
      };
    }

    const trialEnd = subscription.trial_end ?? trial.trialEnd;
    const trialEnded = subscription.status === "trialing" && !isAfterNow(trialEnd);

    if (trialEnded) {
      subscription = { ...subscription, status: "expired" };
    }

    const planInfo = SUBSCRIPTION_PLANS.find((p) => p.id === subscription!.plan) ?? SUBSCRIPTION_PLANS[0];

    return {
      user,
      business,
      businessId,
      subscription,
      planInfo,
      plans: SUBSCRIPTION_PLANS,
      trialStart: subscription.trial_start ?? trial.trialStart,
      trialEnd,
      trialEnded,
      tableFound,
    };
  },

  async saveSubscription(values: Partial<Subscription>) {
    const business_id = await getBusinessId();
    const payload = {
      business_id,
      ...values,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("business_subscriptions")
      .upsert(payload, { onConflict: "business_id" })
      .select("*")
      .single();

    if (error) throw new Error(`Failed to save subscription: ${error.message}`);
    return data as Subscription;
  },
};
