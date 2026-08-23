// File: src/features/Dashboard/components/BookingsCalendar.tsx
// Compact "this week" bookings preview. Full calendar lives at
// /dashboard/appointments — this is the at-a-glance widget for the bento grid.

import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight } from "lucide-react";
import GlassCard from "./GlassCard";

export type UpcomingBooking = {
  id: string;
  customerName: string;
  service: string;
  time: string;
  day: string;
};

type Props = {
  bookings: UpcomingBooking[];
};

export default function BookingsCalendar({ bookings }: Props) {
  const navigate = useNavigate();

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF5A5F]/12 text-[#E14549]">
            <CalendarDays size={18} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#241413]">
              Upcoming Bookings
            </h2>
            <p className="text-xs text-[#B4A29C]">This week</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard/appointments")}
          className="seba-press shrink-0 text-xs font-semibold text-[#E14549] hover:underline"
        >
          Full calendar <ChevronRight size={14} />
        </button>
      </div>

      {bookings.length === 0 ? (
        <p className="mt-6 py-6 text-center text-sm text-[#6B5A56]">
          Nothing booked yet this week.
        </p>
      ) : (
        <div className="mt-5 space-y-2">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-[#F0E3DE]/80 bg-white/50 p-3"
            >
              <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#FFE1CE] to-[#FFF2E6] text-[#B4841F]">
                <span className="text-[10px] font-semibold uppercase leading-none">
                  {b.day}
                </span>
                <span className="text-[10px] font-bold leading-none mt-0.5">
                  {b.time}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#241413]">
                  {b.customerName}
                </p>
                <p className="truncate text-xs text-[#6B5A56]">{b.service}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
