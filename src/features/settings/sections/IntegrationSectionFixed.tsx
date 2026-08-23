import { useEffect, useState } from "react";
import { CalendarDays, ShoppingBag } from "lucide-react";
import { SettingsButton, SettingsCard } from "../components";
import { integrationSettingsService } from "../services/integration-settings.service";

// Bug fix: removed TikTok / Facebook / Instagram / the old "Google logistics" entry
// per request — only Google Calendar (working) and SEBA POS (coming soon) remain.
const PROVIDERS = [
  { key: "google_calendar", label: "Google Calendar", icon: CalendarDays, comingSoon: false },
  { key: "seba_pos", label: "SEBA POS", icon: ShoppingBag, comingSoon: true },
];

type Integration = { provider: string; status: string };

export default function IntegrationSectionFixed() {
  const [items, setItems] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const integrations = await integrationSettingsService.list();
    setItems(integrations as Integration[]);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadIntegrations() {
      try {
        const integrations = await integrationSettingsService.list();
        if (!cancelled) setItems(integrations as Integration[]);
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Failed to load integrations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadIntegrations();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle(provider: string) {
    setBusy(provider);
    setMessage("");
    try {
      const current = items.find((item) => item.provider === provider);
      if (current?.status === "connected") await integrationSettingsService.disconnect(provider);
      else await integrationSettingsService.connect(provider);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update integration");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <SettingsCard title="Integrations" description="Connection state is stored in Supabase.">
        <div className="grid gap-4 md:grid-cols-2">
          {PROVIDERS.map(({ key, label, icon: Icon, comingSoon }) => {
            const integration = items.find((item) => item.provider === key);
            const connected = integration?.status === "connected";
            return (
              <div key={key} className="flex items-center justify-between rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-gray-500" />
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm text-gray-500">
                      {comingSoon ? "Coming soon" : connected ? "Connected" : "Disconnected"}
                    </p>
                  </div>
                </div>
                {comingSoon ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">Coming soon</span>
                ) : (
                  <SettingsButton
                    variant={connected ? "secondary" : "primary"}
                    loading={busy === key}
                    onClick={() => toggle(key)}
                  >
                    {connected ? "Disconnect" : "Connect"}
                  </SettingsButton>
                )}
              </div>
            );
          })}
        </div>
        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
      </SettingsCard>
    </div>
  );
}
