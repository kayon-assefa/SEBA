// src/features/Appointments/components/AppointmentKanbanView.tsx
//
// Drag a card between columns to change its status. Native HTML5 DnD.

import { useState } from "react";
import type { Appointment, AppointmentStatus } from "../types/appointment";
import AppointmentStatus_ from "./AppointmentStatus";

type Props = {
  appointments: Appointment[];
  dark: boolean;
  onOpen: (appointment: Appointment) => void;
  onStatusChange: (appointment: Appointment, status: AppointmentStatus) => void;
};

const COLUMNS: AppointmentStatus[] = ["Pending", "Confirmed", "Completed", "Cancelled", "No-show", "Waitlisted"];

export default function AppointmentKanbanView({ appointments, dark, onOpen, onStatusChange }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);

  function handleDrop(status: AppointmentStatus) {
    if (!dragId) return;
    const appointment = appointments.find((a) => a.id === dragId);
    setDragId(null);
    if (appointment && appointment.status !== status) onStatusChange(appointment, status);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {COLUMNS.map((status) => {
        const items = appointments.filter((a) => a.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(status)}
            className={`flex w-72 shrink-0 flex-col rounded-2xl border ${dark ? "border-white/10 bg-[#1c1c1c]" : "border-gray-200 bg-gray-50"}`}
          >
            <div className={`flex items-center justify-between border-b px-4 py-3 ${dark ? "border-white/10" : "border-gray-200"}`}>
              <AppointmentStatus_ status={status} />
              <span className={`text-xs font-semibold ${dark ? "text-gray-500" : "text-gray-400"}`}>{items.length}</span>
            </div>

            <div className="flex-1 space-y-2 p-3">
              {items.map((a) => (
                <div
                  key={a.id}
                  draggable
                  onDragStart={() => setDragId(a.id)}
                  onClick={() => onOpen(a)}
                  className={`cursor-grab rounded-xl border p-3 text-sm shadow-sm transition active:cursor-grabbing ${
                    dark ? "border-white/10 bg-[#242424] hover:bg-white/5" : "border-gray-200 bg-white hover:shadow-md"
                  }`}
                >
                  <p className={`font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>{a.customer}</p>
                  <p className={`mt-0.5 text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{a.service}</p>
                  <p className={`mt-1.5 text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{a.date} · {a.time}</p>
                </div>
              ))}
              {items.length === 0 && (
                <p className={`px-1 py-6 text-center text-xs ${dark ? "text-gray-600" : "text-gray-300"}`}>Drop here</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
