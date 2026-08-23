// src/features/Appointments/components/AppointmentTable.tsx

import { useEffect, useRef, useState } from "react";
import { CalendarX2, CheckCircle2, XCircle, Pencil, Trash2, UserX, ClipboardList } from "lucide-react";

import type { Appointment, AppointmentStatus } from "../types/appointment";
import AppointmentRow from "./AppointmentRow";

type Props = {
  appointments: Appointment[];
  loading: boolean;
  dark: boolean;
  onOpen: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onStatusChange: (appointment: Appointment, status: AppointmentStatus) => void;
};

const HEADERS = ["Customer", "Service", "Staff", "Date", "Time", "Status", "Price"];

export default function AppointmentTable({ appointments, loading, dark, onOpen, onEdit, onDelete, onStatusChange }: Props) {
  const [menu, setMenu] = useState<{ x: number; y: number; appointment: Appointment } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(null);
    }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  function handleContextMenu(event: React.MouseEvent, appointment: Appointment) {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY, appointment });
  }

  const wrapClass = `overflow-hidden rounded-2xl border ${dark ? "border-white/10 bg-[#1c1c1c]" : "border-gray-200 bg-white"}`;

  if (loading) {
    return (
      <div className={wrapClass}>
        <div className="animate-pulse divide-y divide-gray-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-6 py-4">
              <div className={`h-4 w-32 rounded ${dark ? "bg-white/10" : "bg-gray-200"}`} />
              <div className={`h-4 w-24 rounded ${dark ? "bg-white/10" : "bg-gray-200"}`} />
              <div className={`h-4 w-20 rounded ${dark ? "bg-white/10" : "bg-gray-200"}`} />
              <div className={`h-4 w-20 rounded ${dark ? "bg-white/10" : "bg-gray-200"}`} />
              <div className={`h-6 w-20 rounded-full ${dark ? "bg-white/10" : "bg-gray-200"}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className={wrapClass}>
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${dark ? "bg-white/5" : "bg-gray-50"}`}>
            <CalendarX2 size={28} className={dark ? "text-gray-500" : "text-gray-300"} />
          </div>
          <h3 className={`text-lg font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>No appointments found</h3>
          <p className={`max-w-sm text-sm ${dark ? "text-gray-500" : "text-gray-500"}`}>
            Nothing matches your current filters yet. Try adjusting them, or add a new appointment to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${wrapClass} relative`}>
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className={`border-b text-left ${dark ? "border-white/10 bg-[#242424]" : "border-gray-200 bg-gray-50"}`}>
              {HEADERS.map((h) => (
                <th key={h} className={`px-6 py-4 text-xs font-semibold uppercase tracking-wide ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                appointment={appointment}
                dark={dark}
                onClick={() => onOpen(appointment)}
                onContextMenu={(e) => handleContextMenu(e, appointment)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {menu && (
        <div
          ref={menuRef}
          style={{ position: "fixed", top: menu.y, left: menu.x }}
          className={`z-50 w-52 overflow-hidden rounded-xl border py-1.5 shadow-2xl ${
            dark ? "border-white/10 bg-[#2a2a2a]" : "border-gray-200 bg-white"
          }`}
        >
          <MenuItem dark={dark} icon={ClipboardList} label="View details" onClick={() => { onOpen(menu.appointment); setMenu(null); }} />
          <MenuItem dark={dark} icon={Pencil} label="Edit" onClick={() => { onEdit(menu.appointment); setMenu(null); }} />
          <MenuItem dark={dark} icon={CheckCircle2} label="Mark confirmed" onClick={() => { onStatusChange(menu.appointment, "Confirmed"); setMenu(null); }} />
          <MenuItem dark={dark} icon={CheckCircle2} label="Mark completed" onClick={() => { onStatusChange(menu.appointment, "Completed"); setMenu(null); }} />
          <MenuItem dark={dark} icon={UserX} label="Mark no-show" onClick={() => { onStatusChange(menu.appointment, "No-show"); setMenu(null); }} />
          <MenuItem dark={dark} icon={XCircle} label="Cancel" onClick={() => { onStatusChange(menu.appointment, "Cancelled"); setMenu(null); }} />
          <div className={`my-1 h-px ${dark ? "bg-white/10" : "bg-gray-100"}`} />
          <MenuItem dark={dark} icon={Trash2} label="Delete" danger onClick={() => { onDelete(menu.appointment); setMenu(null); }} />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  dark,
  danger = false,
}: {
  icon: typeof ClipboardList;
  label: string;
  onClick: () => void;
  dark: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition ${
        danger
          ? "text-red-500 hover:bg-red-500/10"
          : dark
          ? "text-gray-200 hover:bg-white/10"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}
