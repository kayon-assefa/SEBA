import { useEffect, useState } from "react";
import { SettingsButton, SettingsCard } from "../components";
import { integrationSettingsService } from "../services/integration-settings.service";

const PROVIDERS = ["chapa", "afripay", "google_calendar", "google_analytics", "instagram", "facebook", "tiktok"];

export default function IntegrationSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      setItems(await integrationSettingsService.list());
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const by = (provider: string) => items.find((item) => item.provider === provider);
  const toggle = async (provider: string) => {
    setBusy(provider);
    try {
      if (by(provider)?.status === "connected") await integrationSettingsService.disconnect(provider);
      else await integrationSettingsService.connect(provider);
      await load();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Failed to update integration");
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading...</div>;

  return <div className="space-y-6"><SettingsCard title="Integrations" description="Connection state is stored in Supabase."><div className="grid gap-4 md:grid-cols-2">{PROVIDERS.map((provider) => { const connected = by(provider)?.status === "connected"; return <div key={provider} className="flex items-center justify-between rounded-xl border p-4"><div><p className="font-semibold capitalize">{provider.replaceAll("_", " ")}</p><p className="text-sm text-gray-500">{connected ? "Connected" : "Disconnected"}</p></div><SettingsButton variant={connected ? "secondary" : "primary"} loading={busy === provider} onClick={() => void toggle(provider)}>{connected ? "Disconnect" : "Connect"}</SettingsButton></div>; })}</div>{msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}</SettingsCard></div>;
}