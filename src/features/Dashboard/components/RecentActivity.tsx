// File: src/features/Dashboard/components/RecentActivity.tsx

import { CalendarClock } from "lucide-react";
import GlassCard from "./GlassCard";

type Appointment = {
  id: string;
  customer: string;
  service: string;
  status: string;
};

type Props = {
  appointments: Appointment[];
};

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-700",
  pending: "bg-[#D9A441]/15 text-[#B4841F]",
  cancelled: "bg-rose-500/10 text-rose-700",
};

export default function RecentActivity({ appointments }: Props) {
  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#241413]">Recent Activity</h2>
        <span className="text-xs font-medium text-[#B4A29C]">
          Last 7 days
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF2E6] text-[#D9A441]">
            <CalendarClock size={20} />
          </span>
          <p className="mt-3 text-sm text-[#6B5A56]">
            No recent activity yet.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="seba-press flex items-center justify-between gap-4 rounded-xl border border-[#F0E3DE]/80 bg-white/50 p-4 transition hover:border-[#D9A441]/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A6E] to-[#D9A441] text-xs font-bold text-white">
                  {appointment.customer.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#241413]">
                    {appointment.customer}
                  </p>
                  <p className="truncate text-xs text-[#6B5A56]">
                    {appointment.service}
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  statusStyles[appointment.status] ??
                  "bg-[#B4A29C]/15 text-[#6B5A56]"
                }`}
              >
                {appointment.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
