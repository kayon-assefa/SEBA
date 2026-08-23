// File: src/features/Dashboard/components/BusinessHours.tsx
// Clear on/off switches (not just a colored dot) so it's obvious at a
// glance — and one tap — whether a day is open.

import { useState } from "react";
import { Clock } from "lucide-react";
import GlassCard from "./GlassCard";

type DayHours = {
  day: string;
  open: boolean;
  from: string;
  to: string;
};

const defaultHours: DayHours[] = [
  { day: "Mon", open: true, from: "09:00", to: "18:00" },
  { day: "Tue", open: true, from: "09:00", to: "18:00" },
  { day: "Wed", open: true, from: "09:00", to: "18:00" },
  { day: "Thu", open: true, from: "09:00", to: "18:00" },
  { day: "Fri", open: true, from: "09:00", to: "18:00" },
  { day: "Sat", open: true, from: "10:00", to: "16:00" },
  { day: "Sun", open: false, from: "10:00", to: "16:00" },
];

export default function BusinessHours() {
  const [hours, setHours] = useState<DayHours[]>(defaultHours);

  function toggleDay(day: string) {
    setHours((prev) =>
      prev.map((d) => (d.day === day ? { ...d, open: !d.open } : d))
    );
  }

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D9A441]/12 text-[#B4841F]">
            <Clock size={18} />
          </span>
          <h2 className="text-sm font-bold text-[#241413]">
            Business Hours
          </h2>
        </div>
        <button className="seba-press shrink-0 text-xs font-semibold text-[#E14549] hover:underline">
          Save
        </button>
      </div>

      <div className="mt-4 space-y-1">
        {hours.map((d) => (
          <div
            key={d.day}
            className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-white/50"
          >
            <span className="w-10 text-xs font-semibold text-[#241413]">
              {d.day}
            </span>

            {d.open ? (
              <span className="seba-tabular flex-1 px-3 text-xs text-[#6B5A56]">
                {d.from} – {d.to}
              </span>
            ) : (
              <span className="flex-1 px-3 text-xs text-[#B4A29C]">
                Closed
              </span>
            )}

            <button
              role="switch"
              aria-checked={d.open}
              aria-label={`Toggle ${d.day}`}
              onClick={() => toggleDay(d.day)}
              className="seba-switch"
              data-on={d.open}
            >
              <span className="seba-switch-knob" />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
