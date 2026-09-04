import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icons";

export type CommandItem = { id: string; label: string; hint?: string; icon: React.ReactNode; action: () => void };

export function CommandPalette({
  open, onClose, items,
}: { open: boolean; onClose: () => void; items: CommandItem[] }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(i => i.label.toLowerCase().includes(s));
  }, [q, items]);

  useEffect(() => { setActive(0); }, [q, open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
      if (e.key === "Enter") { filtered[active]?.action(); onClose(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active, onClose]);

  if (!open) return null;

  return (
    <div className="ss-cmdk-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ss-cmdk">
        <input
          autoFocus className="ss-cmdk-input" placeholder="Search pages, customers, orders…"
          value={q} onChange={e => setQ(e.target.value)}
        />
        <div className="ss-cmdk-list scrollbar">
          {filtered.length === 0 && <div style={{ padding: 20, color: "var(--text-muted)", fontSize: 13.5 }}>No matches.</div>}
          {filtered.map((item, i) => (
            <div
              key={item.id} className={`ss-cmdk-item ${i === active ? "active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => { item.action(); onClose(); }}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.hint && <span style={{ marginLeft: "auto", opacity: .6, fontSize: 11.5 }}>{item.hint}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Convenience hook: builds the default nav commands + Cmd/Ctrl+K listener. */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navItems: CommandItem[] = [
    { id: "dashboard", label: "Go to Dashboard", icon: <Icon.Dashboard size={16} />, action: () => navigate("/staff/dashboard") },
    { id: "appointments", label: "Go to Appointments", icon: <Icon.Calendar size={16} />, action: () => navigate("/staff/appointments") },
    { id: "orders", label: "Go to Orders", icon: <Icon.Bag size={16} />, action: () => navigate("/staff/orders") },
    { id: "customers", label: "Go to Customers", icon: <Icon.Users size={16} />, action: () => navigate("/staff/customers") },
    { id: "schedule", label: "Go to Schedule", icon: <Icon.Clock size={16} />, action: () => navigate("/staff/schedule") },
    { id: "notifications", label: "Go to Notifications", icon: <Icon.Bell size={16} />, action: () => navigate("/staff/notifications") },
    { id: "scan", label: "Scan a SEBA pass", icon: <Icon.QR size={16} />, action: () => navigate("/staff/scan") },
    { id: "settings", label: "Go to Settings", icon: <Icon.Settings size={16} />, action: () => navigate("/staff/settings") },
  ];

  return { open, setOpen, navItems };
}
