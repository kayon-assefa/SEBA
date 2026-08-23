// src/features/Appointments/components/AppointmentCalendarView.tsx
//
// Single-day agenda / calendar view. Appointments can be dragged onto a
// different time slot to reschedule them (native HTML5 drag & drop - no
// extra dependency). Dropping onto an occupied/booked slot is blocked with
// a toast, same conflict rule as the booking form uses.

import { useState } from "react";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Appointment } from "../types/appointment";
import AppointmentStatus from "./AppointmentStatus";
import { BUSINESS_HOURS, findConflicts, toMinutes } from "../lib/availability";

type Props = {
  appointments: Appointment[];
  dark: boolean;
  onOpen: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment, date: string, time: string) => void;
};

function buildSlots() {
  const slots: string[] = [];
  const start = toMinutes(BUSINESS_HOURS.start);
  const end = toMinutes(BUSINESS_HOURS.end);
  for (let t = start; t < end; t += 30) {
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const m = String(t % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
  }
  return slots;
}

const SLOTS = buildSlots();

export default function AppointmentCalendarView({ appointments, dark, onOpen, onReschedule }: Props) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dragId, setDragId] = useState<string | null>(null);

  const dayAppointments = appointments.filter((a) => a.date === date && a.status !== "Cancelled");

  function slotAppointments(slot: string) {
    return dayAppointments.filter((a) => {
      const start = toMinutes(a.time);
      const slotMin = toMinutes(slot);
      return slotMin >= Math.floor(start / 30) * 30 && slotMin < start + (a.duration || 30);
    });
  }

  function handleDrop(slot: string) {
    if (!dragId) return;
    const appointment = appointments.find((a) => a.id === dragId);
    setDragId(null);
    if (!appointment) return;

    const conflicts = findConflicts({
      date,
      time: slot,
      duration: appointment.duration || 30,
      staffMembers: appointment.staff_members?.length ? appointment.staff_members : appointment.staff ? [appointment.staff] : [],
      appointments,
      excludeId: appointment.id,
    });

    if (conflicts.length > 0) {
      toast.error(`${conflicts[0].staff || "That staff member"} is already booked then.`);
      return;
    }

    onReschedule(appointment, date, slot);
  }

  function shiftDay(delta: number) {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  }

  return (
    <div className={`overflow-hidden rounded-2xl border ${dark ? "border-white/10 bg-[#1c1c1c]" : "border-gray-200 bg-white"}`}>
      <div className={`flex items-center justify-between border-b px-6 py-4 ${dark ? "border-white/10" : "border-gray-200"}`}>
        <button onClick={() => shiftDay(-1)} className={`rounded-lg p-2 ${dark ? "hover:bg-white/10 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}>
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <p className={`text-sm font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>
            {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`rounded-lg border px-2 py-1 text-xs ${dark ? "border-white/10 bg-[#242424] text-gray-200" : "border-gray-200"}`} />
        </div>
        <button onClick={() => shiftDay(1)} className={`rounded-lg p-2 ${dark ? "hover:bg-white/10 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="max-h-[65vh] overflow-y-auto">
        {SLOTS.map((slot) => {
          const items = slotAppointments(slot);
          const isHour = slot.endsWith(":00");
          return (
            <div
              key={slot}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(slot)}
              className={`flex min-h-[52px] gap-4 border-b px-6 py-2 ${dark ? "border-white/5" : "border-gray-50"}`}
            >
              <div className={`w-14 shrink-0 pt-1 text-xs ${isHour ? "font-semibold" : ""} ${dark ? "text-gray-500" : "text-gray-400"}`}>{slot}</div>
              <div className="flex flex-1 flex-wrap gap-2">
                {items.map((a) => (
                  <div
                    key={a.id}
                    draggable
                    onDragStart={() => setDragId(a.id)}
                    onClick={() => onOpen(a)}
                    className={`flex cursor-grab items-center gap-2 rounded-lg border px-3 py-1.5 text-xs shadow-sm active:cursor-grabbing ${
                      dark ? "border-white/10 bg-[#242424] hover:bg-white/5" : "border-gray-200 bg-gray-50 hover:bg-white"
                    }`}
                  >
                    <span className={`font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>{a.customer}</span>
                    <span className={dark ? "text-gray-400" : "text-gray-500"}>{a.service}</span>
                    <AppointmentStatus status={a.status} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
