import { useEffect, useState } from "react";
import { SettingsCard, SettingsInput, SettingsSelect, SettingsButton } from "../components";
import { pageSettingsService } from "../services/page-settings.service";

const TEMPLATES = [
  { value: "1", label: "SEBA Classic" },
  { value: "2", label: "SEBA Modern" },
  { value: "3", label: "SEBA Professional" },
  { value: "4", label: "SEBA Minimal" },
  { value: "5", label: "SEBA Commerce" },
];

export default function PageSection() {
  const [s, setS] = useState<any>(null);
  const [initial, setInitial] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    pageSettingsService
      .getTheme()
      .then((x) => {
        const data = x ?? {
          template_id: 1,
          primary_color: "#111827",
          secondary_color: "#6b7280",
          font_family: "Inter",
          border_radius: "12px",
        };
        setS(data);
        setInitial(data);
      })
      .catch((e) => setMsg(e.message));
  }, []);

  if (!s) return <div className="p-6 text-sm text-gray-500">{msg || "Loading…"}</div>;

  const set = (key: string, value: unknown) => setS((x: any) => ({ ...x, [key]: value }));
  const dirty = initial && JSON.stringify(s) !== JSON.stringify(initial);

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const saved = await pageSettingsService.saveTheme({
        template_id: Number(s.template_id),
        primary_color: s.primary_color,
        secondary_color: s.secondary_color,
        font_family: s.font_family,
        border_radius: s.border_radius,
      });
      setS(saved);
      setInitial(saved);
      setMsg("Saved");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsCard title="Public page" description="Choose the template and visual style for your public SEBA page.">
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsSelect
            label="Template"
            value={String(s.template_id ?? 1)}
            onChange={(e) => set("template_id", e.target.value)}
            options={TEMPLATES}
          />
          <SettingsInput label="Primary color" value={s.primary_color ?? ""} onChange={(e) => set("primary_color", e.target.value)} />
          <SettingsInput
            label="Secondary color"
            value={s.secondary_color ?? ""}
            onChange={(e) => set("secondary_color", e.target.value)}
          />
          <SettingsInput label="Font family" value={s.font_family ?? ""} onChange={(e) => set("font_family", e.target.value)} />
          <SettingsInput
            label="Border radius"
            value={s.border_radius ?? ""}
            onChange={(e) => set("border_radius", e.target.value)}
          />
        </div>
        {dirty && (
          <div className="mt-5 flex items-center gap-3">
            <SettingsButton onClick={save} loading={saving}>
              Save page settings
            </SettingsButton>
            {msg && <span className="text-sm text-gray-600">{msg}</span>}
          </div>
        )}
      </SettingsCard>
    </div>
  );
}
