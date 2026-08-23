import { useEffect, useState } from "react";
import { SettingsCard, SettingsInput, SettingsSelect, SettingsToggle, SettingsButton } from "../components";
import { bookingSettingsService } from "../services/booking-settings.service";

export default function BookingSection() {
  const [s, setS] = useState<any>(null);
  const [initial, setInitial] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    bookingSettingsService
      .get()
      .then((data) => {
        setS(data);
        setInitial(data);
      })
      .catch((e) => setMsg(e.message));
  }, []);

  if (!s) return <div className="p-6 text-sm text-gray-500">{msg || "Loading…"}</div>;

  const set = (k: string, v: any) => setS((x: any) => ({ ...x, [k]: v }));
  const dirty = initial && JSON.stringify(s) !== JSON.stringify(initial);

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const saved = await bookingSettingsService.save(s);
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
      <SettingsCard title="Booking">
        <div className="space-y-4">
          {[
            ["enabled", "Enable appointments"],
            ["allow_online_booking", "Allow online booking"],
            ["allow_same_day_booking", "Allow same-day booking"],
            ["allow_cancellation", "Allow cancellation"],
            ["allow_rescheduling", "Allow rescheduling"],
          ].map(([k, l]) => (
            <SettingsToggle key={k} label={l} checked={!!s[k]} onChange={(v) => set(k, v)} />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Booking limits">
        <div className="grid gap-4 md:grid-cols-3">
          <SettingsInput
            label="Minimum notice (minutes)"
            type="number"
            value={s.minimum_booking_notice_minutes}
            onChange={(e) => set("minimum_booking_notice_minutes", Number(e.target.value))}
          />
          <SettingsInput
            label="Maximum advance (days)"
            type="number"
            value={s.maximum_advance_booking_days}
            onChange={(e) => set("maximum_advance_booking_days", Number(e.target.value))}
          />
          <SettingsInput
            label="Maximum daily appointments"
            type="number"
            value={s.maximum_daily_appointments ?? ""}
            onChange={(e) => set("maximum_daily_appointments", e.target.value === "" ? null : Number(e.target.value))}
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Appointment behavior">
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsInput
            label="Default duration"
            type="number"
            value={s.default_duration_minutes}
            onChange={(e) => set("default_duration_minutes", Number(e.target.value))}
          />
          <SettingsInput
            label="Buffer time"
            type="number"
            value={s.buffer_minutes}
            onChange={(e) => set("buffer_minutes", Number(e.target.value))}
          />
        </div>
        <div className="mt-4">
          <SettingsSelect
            label="Confirmation"
            value={s.auto_confirm ? "automatic" : "manual"}
            onChange={(e) => set("auto_confirm", e.target.value === "automatic")}
            options={[
              { label: "Automatically confirm", value: "automatic" },
              { label: "Require approval", value: "manual" },
            ]}
          />
        </div>
      </SettingsCard>

      {/* Bug fix: this card previously had no Save button, so toggling these did nothing. */}
      <SettingsCard title="Customer information" description="Which details are required when a customer books.">
        <div className="space-y-4">
          {[
            ["require_customer_name", "Name"],
            ["require_customer_phone", "Phone"],
            ["require_customer_email", "Email"],
            ["require_customer_notes", "Notes"],
          ].map(([k, l]) => (
            <SettingsToggle key={k} label={l} checked={!!s[k]} onChange={(v) => set(k, v)} />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Booking messages">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Confirmation message</p>
              <p className="text-sm text-gray-500">Custom confirmation messages are coming soon.</p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">Coming soon</span>
          </div>
          {[
            ["cancellation_message", "Cancellation message"],
            ["reminder_message", "Reminder message"],
            ["completion_message", "Completion message"],
          ].map(([k, l]) => (
            <SettingsInput key={k} label={l} value={s[k] ?? ""} onChange={(e) => set(k, e.target.value || null)} />
          ))}
        </div>
      </SettingsCard>

      {dirty && (
        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-[#FFFDF8] p-4 shadow-lg">
          <p className="text-sm text-gray-500">You have unsaved changes.</p>
          <div className="flex items-center gap-3">
            <SettingsButton onClick={save} loading={saving}>
              Save booking settings
            </SettingsButton>
            {msg && <span className="text-sm text-gray-600">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
