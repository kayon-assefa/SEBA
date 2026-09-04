import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  getInvoices,
  getPayments,
  getSubscription,
  reactivateSubscription,
  requestCancellation,
  startAfriPayPayment,
} from "../service";
import { getPlan, PLANS, type Invoice, type Payment, type Subscription, type SubscriptionPlan } from "../types";

function money(value: number, currency = "ETB") {
  return `${new Intl.NumberFormat("en-US").format(value)} ${currency}`;
}

function date(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

function daysLeft(value: string | null) {
  if (!value) return 0;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86400000));
}

function StatusPill({ status }: { status: Subscription["status"] }) {
  const label = status.replaceAll("_", " ");
  const tone =
    status === "active"
      ? "bg-emerald-50 text-emerald-700"
      : status === "trialing"
        ? "bg-blue-50 text-blue-700"
        : status === "cancelled"
          ? "bg-amber-50 text-amber-700"
          : "bg-red-50 text-red-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${tone}`}>{label}</span>;
}

function PlanCard({
  plan,
  current,
  busy,
  onChoose,
}: {
  plan: ReturnType<typeof getPlan>;
  current: SubscriptionPlan;
  busy: boolean;
  onChoose: (plan: SubscriptionPlan) => void;
}) {
  const isCurrent = plan.id === current;
  const isPro = plan.id === "pro";

  return (
    <div className={`relative rounded-2xl border p-5 ${isPro ? "border-gray-900 shadow-md" : "border-gray-200"} bg-white`}>
      {isPro && (
        <div className="absolute -top-3 left-5 rounded-full bg-gray-900 px-3 py-1 text-xs font-bold text-white">
          Most popular
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
        </div>
        {isCurrent && <StatusPill status="active" />}
      </div>

      <p className="mt-5 text-3xl font-bold text-gray-900">
        {money(plan.price)}<span className="text-sm font-medium text-gray-500"> / month</span>
      </p>

      <ul className="mt-5 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2 text-sm text-gray-700">
            <Check size={16} className="mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={isCurrent || busy}
        onClick={() => onChoose(plan.id)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : null}
        {isCurrent ? "Current Plan" : plan.price > getPlan(current).price ? `Upgrade to ${plan.name}` : `Choose ${plan.name}`}
      </button>
    </div>
  );
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyPlan, setBusyPlan] = useState<SubscriptionPlan | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [showInvoice, setShowInvoice] = useState<Invoice | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [sub, history, invoiceRows] = await Promise.all([
        getSubscription(),
        getPayments(),
        getInvoices(),
      ]);
      setSubscription(sub);
      setPayments(history);
      setInvoices(invoiceRows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load subscription.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const currentPlan = subscription ? getPlan(subscription.plan) : PLANS[0];
  const trialDays = daysLeft(subscription?.trial_end ?? null);
  const trialExpired = subscription?.status === "expired";
  const trialing = subscription?.status === "trialing";
  const staffUsed = null;

  const usageMessage = useMemo(() => {
    if (staffUsed == null) return "Staff usage is loaded from your existing staff records when available.";
    return `${staffUsed} / ${currentPlan.staffLimit}`;
  }, [staffUsed, currentPlan.staffLimit]);

  async function choosePlan(plan: SubscriptionPlan) {
    if (!subscription || plan === subscription.plan) return;

    try {
      setBusyPlan(plan);
      setError("");
      await startAfriPayPayment(plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start payment.");
    } finally {
      setBusyPlan(null);
    }
  }

  async function cancel() {
    try {
      setActionBusy(true);
      setError("");
      const updated = await requestCancellation();
      setSubscription(updated);
      setShowCancel(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to cancel subscription.");
    } finally {
      setActionBusy(false);
    }
  }

  async function reactivate() {
    try {
      setActionBusy(true);
      setError("");
      const updated = await reactivateSubscription();
      setSubscription(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to reactivate subscription.");
    } finally {
      setActionBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-8 text-center">
          <h1 className="text-xl font-bold">Subscription is not ready</h1>
          <p className="mt-2 text-sm text-gray-500">Run the supplied Supabase migration first.</p>
          <button onClick={() => void load()} className="mt-5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="seba-dashboard mx-auto w-full max-w-[1400px]">
      <div className="seba-glass seba-rise">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <button type="button" onClick={() => window.history.back()} className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your SEBA plan and billing.</p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {error && (
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss"><X size={18} /></button>
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-[#FFFDF8] p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Current plan</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-bold text-gray-900">{currentPlan.name}</h2>
                <StatusPill status={subscription.status} />
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-700">{money(currentPlan.price)} / month</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 text-sm">
              <p className="text-gray-500">Next payment</p>
              <p className="mt-1 font-semibold text-gray-900">{date(subscription.next_billing_date ?? subscription.current_period_end)}</p>
            </div>
          </div>

          {trialing && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-blue-900">{trialDays}-day free trial</p>
                  <p className="mt-1 text-sm text-blue-800">
                    {trialDays === 0 ? "Your trial ends today." : `Your trial ends ${date(subscription.trial_end)}.`}
                  </p>
                </div>
                <span className="text-sm font-semibold text-blue-900">{trialDays} days remaining</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(4, Math.min(100, ((14 - trialDays) / 14) * 100))}%` }} />
              </div>
            </div>
          )}

          {trialExpired && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-bold text-red-900">Your free trial has ended.</p>
              <p className="mt-1 text-sm text-red-800">Choose a SEBA plan to continue using your business account.</p>
            </div>
          )}

          {subscription.status === "past_due" && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <b>Payment issue.</b> We couldn't process your latest subscription payment. Your account is currently in a grace period.
            </div>
          )}

          {subscription.status === "cancelled" && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-900">You won't be charged again.</p>
              <p className="mt-1 text-sm text-amber-800">Your plan remains active until {date(subscription.current_period_end)}.</p>
              <button disabled={actionBusy} onClick={() => void reactivate()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {actionBusy && <Loader2 size={15} className="animate-spin" />} Reactivate Subscription
              </button>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Choose your plan</h2>
            <p className="mt-1 text-sm text-gray-500">Monthly billing. Payment is confirmed by the SEBA backend after AfriPay verification.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} current={subscription.plan} busy={busyPlan === plan.id} onChoose={choosePlan} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-[#FFFDF8] shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
            <h2 className="font-bold text-gray-900">Feature comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead><tr className="border-b text-xs uppercase tracking-wide text-gray-400"><th className="px-5 py-3">Feature</th><th className="px-5 py-3">Basic</th><th className="px-5 py-3">Pro</th><th className="px-5 py-3">Enterprise</th></tr></thead>
              <tbody>
                {[
                  ["Public Business Page", "✓", "✓", "✓"],
                  ["Appointments", "✓", "✓", "✓"],
                  ["Shop", "✓", "✓", "✓"],
                  ["Basic Analytics", "✓", "✓", "✓"],
                  ["Advanced Analytics", "—", "✓", "✓"],
                  ["Staff", "1", "3", "6"],
                  ["SEO", "Basic", "Advanced", "Advanced"],
                  ["Customization", "Basic", "Advanced", "Advanced"],
                  ["Branches", "—", "—", "✓"],
                  ["Advanced Permissions", "—", "—", "✓"],
                ].map(([feature, basic, pro, enterprise]) => (
                  <tr key={feature} className="border-b last:border-0">
                    <td className="px-5 py-3 font-medium text-gray-800">{feature}</td>
                    <td className="px-5 py-3 text-gray-600">{basic}</td>
                    <td className="px-5 py-3 text-gray-600">{pro}</td>
                    <td className="px-5 py-3 text-gray-600">{enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-[#FFFDF8] p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-100 p-2"><RefreshCw size={18} /></div>
            <div><h2 className="font-bold text-gray-900">Your Usage</h2><p className="text-sm text-gray-500">{usageMessage}</p></div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-4"><p className="text-sm text-gray-500">Staff accounts</p><p className="mt-1 text-lg font-bold">{staffUsed == null ? "—" : `${staffUsed} / ${currentPlan.staffLimit}`}</p></div>
            <div className="rounded-xl border bg-white p-4"><p className="text-sm text-gray-500">Products</p><p className="mt-1 text-lg font-bold">—</p><p className="text-xs text-gray-400">Connect to your shop count when that table is finalized.</p></div>
            <div className="rounded-xl border bg-white p-4"><p className="text-sm text-gray-500">Appointments</p><p className="mt-1 text-lg font-bold">—</p><p className="text-xs text-gray-400">Connect to your booking count when that table is finalized.</p></div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-[#FFFDF8] p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <CreditCard size={19} />
            <h2 className="font-bold text-gray-900">Billing</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-xs text-gray-500">Current plan</p><p className="mt-1 font-semibold">{currentPlan.name}</p></div>
            <div><p className="text-xs text-gray-500">Price</p><p className="mt-1 font-semibold">{money(currentPlan.price)} / month</p></div>
            <div><p className="text-xs text-gray-500">Payment provider</p><p className="mt-1 font-semibold">AfriPay</p></div>
            <div><p className="text-xs text-gray-500">Billing cycle</p><p className="mt-1 font-semibold">Monthly</p></div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-[#FFFDF8] shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
            <h2 className="font-bold text-gray-900">Billing History</h2>
          </div>
          <div className="divide-y">
            {invoices.length === 0 && payments.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No billing history yet.</div>
            ) : (
              [...invoices].map((invoice) => (
                <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <div>
                    <p className="font-semibold text-gray-900">{date(invoice.issued_at)}</p>
                    <p className="text-sm text-gray-500">{currentPlan.name} · {invoice.invoice_number}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{money(invoice.amount, invoice.currency)}</span>
                    <span className="text-sm font-medium text-emerald-700">{invoice.status}</span>
                    <button onClick={() => setShowInvoice(invoice)} className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"><FileText size={15} /> View</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-[#FFFDF8] p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck size={19} className="mt-0.5" />
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">Subscription security</h2>
              <p className="mt-1 text-sm text-gray-500">Payment success and plan activation are verified server-side. The browser never marks a payment as paid.</p>
            </div>
          </div>
          {subscription.status !== "cancelled" && (
            <button type="button" onClick={() => setShowCancel(true)} className="mt-5 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50">
              Cancel Subscription
            </button>
          )}
        </section>
      </main>

      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">Cancel {currentPlan.name}?</h2>
            <p className="mt-2 text-sm text-gray-600">You'll keep {currentPlan.name} until {date(subscription.current_period_end)}. You won't be charged again after cancellation.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCancel(false)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">Keep Subscription</button>
              <button disabled={actionBusy} onClick={() => void cancel()} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {actionBusy ? "Cancelling…" : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">SEBA Invoice</h2><button onClick={() => setShowInvoice(null)}><X /></button></div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Invoice</span><b>{showInvoice.invoice_number}</b></div>
              <div className="flex justify-between"><span className="text-gray-500">Plan</span><b>{currentPlan.name}</b></div>
              <div className="flex justify-between"><span className="text-gray-500">Billing period</span><b>{date(showInvoice.billing_period_start)} – {date(showInvoice.billing_period_end)}</b></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><b>{money(showInvoice.amount, showInvoice.currency)}</b></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment provider</span><b>AfriPay</b></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><b className="text-emerald-700">{showInvoice.status.toUpperCase()}</b></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
