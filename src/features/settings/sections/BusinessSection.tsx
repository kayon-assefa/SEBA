import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { SettingsCard, SettingsInput, SettingsToggle, SettingsButton } from "../components";
import { businessSettingsService } from "../services/business-settings.service";

function todayPlusOne() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function BusinessSection() {
  const [s, setS] = useState<any>(null);
  const [initial, setInitial] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    businessSettingsService
      .get()
      .then((data) => {
        setS(data);
        setInitial(data);
      })
      .catch((e) => setMsg(e.message));
  }, []);

  if (!s && !msg) return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  if (!s) return <div className="p-6 text-sm text-red-600">{msg}</div>;

  const set = (k: string, v: any) => setS((x: any) => ({ ...x, [k]: v }));
  const dirty = initial && JSON.stringify(s) !== JSON.stringify(initial);

  const save = async () => {
    if (s.is_temporarily_closed && s.temporary_close_until) {
      const chosen = new Date(s.temporary_close_until);
      if (chosen <= new Date()) {
        setDateError("The reopening date must be in the future.");
        return;
      }
    }
    setDateError("");
    setSaving(true);
    setMsg("");
    try {
      const saved = await businessSettingsService.save(s);
      setS(saved);
      setInitial(saved);
      setMsg("Saved");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const hasLocation = s.latitude != null && s.longitude != null;
  const mapEmbedSrc = hasLocation
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${s.longitude - 0.01}%2C${s.latitude - 0.01}%2C${s.longitude + 0.01}%2C${s.latitude + 0.01}&layer=mapnik&marker=${s.latitude}%2C${s.longitude}`
    : null;

  return (
    <div className="space-y-6">
      <SettingsCard title="Business information" description="Contact information shown for your business.">
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsInput
            label="Business phone"
            value={s.business_phone ?? ""}
            onChange={(e) => set("business_phone", e.target.value)}
          />
          <SettingsInput
            label="Business email"
            type="email"
            value={s.business_email ?? ""}
            onChange={(e) => set("business_email", e.target.value)}
          />
          <SettingsInput label="City" value={s.city ?? ""} onChange={(e) => set("city", e.target.value)} />
          <SettingsInput label="Address" value={s.address ?? ""} onChange={(e) => set("address", e.target.value)} />
        </div>
      </SettingsCard>

      <SettingsCard title="Location" description="Where customers see your business on the map.">
        {mapEmbedSrc ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <iframe title="Business location" src={mapEmbedSrc} className="h-56 w-full" loading="lazy" />
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
            <MapPin size={16} />
            No location pin set yet. Set it from the map picker when editing your business page.
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="Availability" description="Your page is published by default and cannot be unpublished here.">
        <SettingsToggle
          label="Temporarily closed"
          description="Turn this on to show visitors you're closed, without unpublishing your page."
          checked={s.is_temporarily_closed}
          onChange={(v) => set("is_temporarily_closed", v)}
        />
        {s.is_temporarily_closed && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <SettingsInput
              label="Reason"
              value={s.temporary_close_reason ?? ""}
              onChange={(e) => set("temporary_close_reason", e.target.value)}
              placeholder="e.g. Public holiday"
            />
            <SettingsInput
              label="Reopens on"
              type="date"
              min={todayPlusOne()}
              value={s.temporary_close_until ?? ""}
              onChange={(e) => set("temporary_close_until", e.target.value)}
              error={dateError}
            />
          </div>
        )}
      </SettingsCard>

      {dirty && (
        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-[#FFFDF8] p-4 shadow-lg">
          <p className="text-sm text-gray-500">You have unsaved changes.</p>
          <div className="flex items-center gap-3">
            <SettingsButton onClick={save} loading={saving}>
              Save business
            </SettingsButton>
            {msg && <span className="text-sm text-gray-600">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
