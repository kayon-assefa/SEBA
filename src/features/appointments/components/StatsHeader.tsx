// src/features/Appointments/components/StatsHeader.tsx

import { CalendarCheck2, Clock3, UserX } from "lucide-react";
import type { Appointment } from "../types/appointment";

type Props = {
  appointments: Appointment[];
  dark: boolean;
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function StatsHeader({ appointments, dark }: Props) {
  const today = todayStr();

  const todaysAppointments = appointments.filter((a) => a.date === today && a.status !== "Cancelled");
  const upcoming = appointments.filter(
    (a) => a.date >= today && (a.status === "Pending" || a.status === "Confirmed")
  ).length;

  const noShows = appointments.filter((a) => a.status === "No-show").length;

  const cards = [
    { label: "Today's Appointments", value: todaysAppointments.length, icon: CalendarCheck2, accent: "text-blue-500 bg-blue-500/10" },
    { label: "Upcoming", value: upcoming, icon: Clock3, accent: "text-amber-500 bg-amber-500/10" },
    { label: "No-shows", value: noShows, icon: UserX, accent: "text-red-500 bg-red-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition ${
            dark ? "border-white/10 bg-[#242424]" : "border-gray-200 bg-white"
          }`}
        >
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.accent}`}>
            <card.icon size={20} />
          </div>
          <div className="min-w-0">
            <p className={`truncate text-xs font-medium ${dark ? "text-gray-400" : "text-gray-500"}`}>{card.label}</p>
            <p className={`text-lg font-bold ${dark ? "text-white" : "text-[#2B2B2B]"}`}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
