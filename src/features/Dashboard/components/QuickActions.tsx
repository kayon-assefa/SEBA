// File: src/features/Dashboard/components/QuickActions.tsx
// Floating "quick add" button (bottom-right) that expands into a radial-ish
// stack of shortcuts. Ripple + scale micro-interactions on every button.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  PackagePlus,
  Pencil,
  Globe,
  Plus,
  X,
} from "lucide-react";

const actions = [
  { label: "New Appointment", icon: CalendarPlus, to: "/dashboard/appointments" },
  { label: "New Product", icon: PackagePlus, to: "/dashboard/products" },
  { label: "Edit Website", icon: Pencil, to: "/dashboard/settings/website" },
  { label: "View Website", icon: Globe, to: "/dashboard/settings/website?preview=1" },
];

export default function QuickActions() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-end gap-3 border-t border-[#F0E3DE]/70 pt-6">
      {open && (
        <div className="flex flex-col items-end gap-2">
          {actions.map((action, i) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => {
                  setOpen(false);
                  navigate(action.to);
                }}
                style={{ animationDelay: `${i * 40}ms` }}
                className="seba-rise seba-press seba-ripple flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#241413] shadow-lg backdrop-blur-xl transition hover:border-[#D9A441]"
              >
                {action.label}
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF2E6] text-[#E14549]">
                  <ActionIcon size={16} />
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Quick actions"
        className={`seba-press seba-ripple flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A6E] to-[#FF5A5F] text-white shadow-[0_10px_30px_rgba(255,90,95,0.45)] transition-transform ${
          open ? "rotate-45" : "hover:scale-105"
        }`}
      >
        {open ? <X size={22} /> : <Plus size={22} />}
      </button>
    </div>
  );
}
