import { useEffect, useState } from "react";
import { SettingsCard, SettingsToggle, SettingsButton } from "../components";
import { shopSettingsService } from "../services/shop-settings.service";
import { pageSettingsService } from "../services/page-settings.service";

const TEMPLATE_PREVIEWS: Record<string, { label: string; accent: string }> = {
  "1": { label: "SEBA Classic", accent: "#111827" },
  "2": { label: "SEBA Modern", accent: "#2563eb" },
  "3": { label: "SEBA Professional", accent: "#0f766e" },
  "4": { label: "SEBA Minimal", accent: "#525252" },
  "5": { label: "SEBA Commerce", accent: "#b45309" },
};

export default function ShopSection() {
  const [s, setS] = useState<any>(null);
  const [initial, setInitial] = useState<any>(null);
  const [theme, setTheme] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([shopSettingsService.get(), pageSettingsService.getTheme()])
      .then(([shop, themeData]) => {
        setS(shop);
        setInitial(shop);
        setTheme(themeData ?? { template_id: 1, primary_color: "#111827" });
      })
      .catch((e) => setMsg(e.message));
  }, []);

  if (!s) return <div className="p-6 text-sm text-gray-500">{msg || "Loading…"}</div>;

  const set = (k: string, v: boolean) => setS((x: any) => ({ ...x, [k]: v }));
  const dirty = initial && JSON.stringify(s) !== JSON.stringify(initial);

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const saved = await shopSettingsService.saveState(s);
      setS(saved);
      setInitial(saved);
      setMsg("Saved");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const preview = TEMPLATE_PREVIEWS[String(theme?.template_id ?? 1)] ?? TEMPLATE_PREVIEWS["1"];
  const accent = theme?.primary_color || preview.accent;

  return (
    <div className="space-y-6">
      <SettingsCard title="Shop state" description="Controls for your shop page, based on your live database.">
        <div className="space-y-4">
          <SettingsToggle label="Accept orders" checked={!s.orders_paused} onChange={(v) => set("orders_paused", !v)} />
          <SettingsToggle
            label="Accept appointments"
            checked={!s.appointments_paused}
            onChange={(v) => set("appointments_paused", !v)}
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Live preview" description={`Based on your selected template: ${preview.label}.`}>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div style={{ background: accent }} className="h-14 px-4 py-3">
            <div className="h-3 w-28 rounded-full bg-white/70" />
          </div>
          <div className="space-y-3 bg-white p-4">
            <div className="h-3 w-2/3 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="h-12 rounded-lg bg-gray-100" />
              <div className="h-12 rounded-lg bg-gray-100" />
              <div className="h-12 rounded-lg bg-gray-100" />
            </div>
            {s.orders_paused && (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                Orders are currently paused
              </div>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          This mirrors the template and color chosen in the Page tab — change those there.
        </p>
      </SettingsCard>

      {/* Bug fix: Save was always visible even with no changes. Now it only appears when dirty. */}
      {dirty && (
        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-[#FFFDF8] p-4 shadow-lg">
          <p className="text-sm text-gray-500">You have unsaved changes.</p>
          <div className="flex items-center gap-3">
            <SettingsButton onClick={save} loading={saving}>
              Save shop settings
            </SettingsButton>
            {msg && <span className="text-sm text-gray-600">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
