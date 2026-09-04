import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { SettingsCard, SettingsButton } from "../components";
import { PLANS } from "../../subscription/types";

function date(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

const STAFF_LIMITS: Record<string, number> = { basic: 1, premium: 2, enterprise: 4 };

export default function SubscriptionSection() {
  const navigate = useNavigate();
  const [ctx, setCtx] = useState<any>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    import("../services/subscription-settings.service")
      .then(({ subscriptionSettingsService }) => subscriptionSettingsService.getContext())
      .then(setCtx)
      .catch((e) => setMsg(e.message));
  }, []);

  if (!ctx) return <div className="p-6 text-sm text-gray-500">{msg || "Loading subscription…"}</div>;

  const sub = ctx.subscription;
  const trialEnded = ctx.trialEnded;
  const status = trialEnded ? "free trial ended" : sub.status;
  const staffLimit = STAFF_LIMITS[sub.plan] ?? 1;

  return (
    <div className="space-y-6">
      <SettingsCard title="Your subscription" description="Pulled live from your account and the subscription record in Supabase.">
        <div className="rounded-2xl border p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Current plan</p>
              <h3 className="mt-1 text-2xl font-bold capitalize">{sub.plan}</h3>
              <p className="mt-1 text-xs text-gray-500">Up to {staffLimit} staff account{staffLimit > 1 ? "s" : ""}</p>
            </div>
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold",
                trialEnded || sub.status !== "active" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700",
              ].join(" ")}
            >
              {status}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">Trial start</p>
              <p className="mt-1 font-medium">{date(sub.trial_start ?? sub.start_date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Trial end</p>
              <p className="mt-1 font-medium">{date(sub.trial_end ?? sub.end_date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Next billing</p>
              <p className="mt-1 font-medium">{date(sub.next_billing_date)}</p>
            </div>
          </div>

          {(trialEnded || sub.status !== "active") && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Your subscription isn't active. Staff logins are disabled and your page will stop accepting new
              orders and appointments until you renew.
            </div>
          )}

          <div className="mt-5">
            <SettingsButton onClick={() => navigate("/dashboard/subscription")}>Upgrade plan</SettingsButton>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Available plans" description="Choose the plan that fits your business. You can securely complete payment on the subscription page.">
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const current = plan.id === sub.plan;

            return (
              <div key={plan.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                    </div>
                    {current && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">Current</span>}
                  </div>
                  <p className="mt-4 text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat("en-US").format(plan.price)} ETB<span className="text-sm font-medium text-gray-500"> / month</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex gap-2 text-sm text-gray-600">
                        <Check size={16} className="mt-0.5 shrink-0 text-gray-900" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <SettingsButton
                  className="mt-6 w-full justify-center"
                  disabled={current}
                  onClick={() => navigate("/dashboard/subscription")}
                >
                  {current ? "Current plan" : `Upgrade to ${plan.name}`}
                </SettingsButton>
              </div>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
}
