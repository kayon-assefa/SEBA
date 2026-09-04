import React from "react";
import { Icon } from "./Icons";
import { initials } from "../utils/format";
import { useLanguage } from "../i18n";

/**
 * Every value the owner app actually writes (case-sensitive):
 *   Appointments: Pending, Confirmed, Completed, Cancelled, No-show, Waitlisted
 *   Appointment payment: Unpaid, Deposit, Paid
 *   Orders: pending, confirmed, processing, ready, completed, cancelled
 *   Order payment: pending, paid, failed, refunded
 * StatusPill normalizes case/spacing so ALL of these resolve to a styled,
 * always-visible pill — no status silently renders blank anymore.
 */
const KNOWN_KEYS = new Set([
  "pending", "confirmed", "completed", "cancelled", "no-show", "waitlisted",
  "processing", "ready", "unpaid", "deposit", "paid", "failed", "refunded",
]);

function normalize(status?: string | null) {
  const key = (status || "unknown").trim().toLowerCase().replace(/[\s_]+/g, "-");
  return KNOWN_KEYS.has(key) ? key : "unknown";
}

export function StatusPill({ status }: { status?: string | null }) {
  const { t } = useLanguage();
  const key = normalize(status);
  const label = key === "unknown" ? (status || t("status.unknown")) : t(`status.${key}`);
  return <span className={`ss-pill ss-pill-${key.replace(/-/g, "_")}`}>{label}</span>;
}

/* ------------------------------------ Avatar ------------------------------------ */
export function Avatar({ name, size = "md" }: { name?: string | null; size?: "sm" | "md" | "lg" }) {
  return <div className={`ss-avatar ${size === "sm" ? "sm" : size === "lg" ? "lg" : ""}`}>{initials(name)}</div>;
}

/* ---------------------------------- StatCard ---------------------------------- */
export function StatCard({
  label, value, icon, tint, trend,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tint: "coral" | "gold" | "deepred" | "info";
  trend?: { direction: "up" | "down"; text: string };
}) {
  const colors: Record<string, string> = {
    coral: "var(--primary)", gold: "var(--accent)", deepred: "var(--secondary)", info: "var(--info)",
  };
  const c = colors[tint];
  return (
    <div className="ss-stat-card">
      <div className="blob" style={{ background: c }} />
      <div className="icon-wrap" style={{ background: `${c}22`, color: c }}>{icon}</div>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {trend && (
        <div className={`trend ${trend.direction}`}>
          {trend.direction === "up" ? <Icon.TrendUp size={13} /> : <Icon.TrendDown size={13} />}
          {trend.text}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- EmptyState ---------------------------------- */
export function EmptyState({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="ss-empty">
      {icon || <Icon.Bag size={40} />}
      <div className="title">{title}</div>
      {subtitle && <div>{subtitle}</div>}
    </div>
  );
}

/* ------------------------------------ Skeleton ------------------------------------ */
export function Skeleton({ h = 16, w = "100%", r = 8 }: { h?: number; w?: number | string; r?: number }) {
  return <div className="ss-skel" style={{ height: h, width: w, borderRadius: r }} />;
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} h={54} r={12} />)}
    </div>
  );
}

/* -------------------------------------- Tabs -------------------------------------- */
export function Tabs<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="ss-tabs">
      {options.map(o => (
        <button key={o.value} className={`ss-tab ${value === o.value ? "active" : ""}`} onClick={() => onChange(o.value)}>
          {o.label}{o.count != null ? ` (${o.count})` : ""}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------- Chips ------------------------------------- */
export function FilterChips<T extends string>({ value, onChange, options }: {
  value: T[]; onChange: (v: T[]) => void; options: { value: T; label: string }[];
}) {
  function toggle(v: T) {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  }
  return (
    <div className="ss-chips">
      {options.map(o => (
        <button key={o.value} className={`ss-chip ${value.includes(o.value) ? "active" : ""}`} onClick={() => toggle(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------------- ProgressBar ----------------------------------- */
export function ProgressBar({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent));
  return <div className="ss-progress-track"><div className="ss-progress-bar" style={{ width: `${p}%` }} /></div>;
}
