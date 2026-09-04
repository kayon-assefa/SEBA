import { supabase } from "../../lib/supabase";
import { getActiveBusinessId } from "../../lib/business";
import type { Invoice, Payment, Subscription, SubscriptionPlan } from "./types";

export async function getBusinessId() {
  return getActiveBusinessId();
}

export async function getSubscription(): Promise<Subscription | null> {
  const businessId = await getBusinessId();
  const { data, error } = await supabase
    .from("business_subscriptions")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load subscription: ${error.message}`);
  return data as Subscription | null;
}

export async function getPayments(): Promise<Payment[]> {
  const businessId = await getBusinessId();
  const { data, error } = await supabase
    .from("subscription_payments")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load payment history: ${error.message}`);
  return (data ?? []) as Payment[];
}

export async function getInvoices(): Promise<Invoice[]> {
  const businessId = await getBusinessId();
  const { data, error } = await supabase
    .from("subscription_invoices")
    .select("*")
    .eq("business_id", businessId)
    .order("issued_at", { ascending: false });

  if (error) throw new Error(`Failed to load invoices: ${error.message}`);
  return (data ?? []) as Invoice[];
}

/**
 * Starts the secure AfriPay flow.
 * The Edge Function must create the provider transaction and return:
 * { checkout_url: string, payment_id: string }
 *
 * The browser must never mark a payment as paid or activate a plan itself.
 */
export async function startAfriPayPayment(plan: SubscriptionPlan) {
  const businessId = await getBusinessId();

  const { data, error } = await supabase.functions.invoke(
    "create-afripay-payment",
    { body: { business_id: businessId, plan } }
  );

  if (error) throw new Error(error.message || "Unable to start payment.");
  if (!data?.checkout_url) {
    throw new Error(data?.error || "AfriPay did not return a checkout URL.");
  }

  window.location.assign(data.checkout_url);
}

export async function requestCancellation() {
  const businessId = await getBusinessId();

  const { data, error } = await supabase.rpc("request_subscription_cancellation", {
    p_business_id: businessId,
  });

  if (error) throw new Error(error.message);
  return data as Subscription;
}

export async function reactivateSubscription() {
  const businessId = await getBusinessId();

  const { data, error } = await supabase.rpc("reactivate_subscription", {
    p_business_id: businessId,
  });

  if (error) throw new Error(error.message);
  return data as Subscription;
}
