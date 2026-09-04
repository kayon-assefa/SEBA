export function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

export function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr.length <= 10 ? `${dateStr}T00:00:00` : dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function formatTime(timeStr?: string | null) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m ?? 0).padStart(2, "0")} ${period}`;
}

export function formatDateTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function relativeTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

/** Matches the exact "123.00 ETB" style used by the owner app's receipts. */
export function formatCurrency(n?: number | null) {
  if (n == null) return "—";
  const amount = Number(n) || 0;
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Appointments may carry either the legacy singular `service`/`staff` fields
 *  or the newer `services[]`/`staff_members[]` arrays — this always returns
 *  the fullest picture available so nothing gets silently dropped. */
export function serviceLabel(a: { service?: string | null; services?: string[] | null }) {
  if (a.services && a.services.length) return a.services.join(", ");
  return a.service || "—";
}

export function staffLabel(a: { staff?: string | null; staff_members?: string[] | null }) {
  if (a.staff_members && a.staff_members.length) return a.staff_members.join(", ");
  return a.staff || "Unassigned";
}
