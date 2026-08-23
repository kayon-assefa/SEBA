import { useEffect, useState } from "react";
import { SettingsCard, SettingsButton } from "../components";

function date(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

const STAFF_LIMITS: Record<string, number> = { basic: 1, premium: 2, enterprise: 4 };

export default function SubscriptionSection() {
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
            <SettingsButton onClick={() => (window.location.href = "/subscription")}>Upgrade plan</SettingsButton>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
