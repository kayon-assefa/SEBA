// src/features/Appointments/components/AppointmentRow.tsx

import type { Appointment } from "../types/appointment";
import AppointmentStatus from "./AppointmentStatus";

type Props = {
  appointment: Appointment;
  onClick: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
  dark: boolean;
};

export default function AppointmentRow({ appointment, onClick, onContextMenu, dark }: Props) {
  const services = appointment.services?.length ? appointment.services.join(", ") : appointment.service;
  const staff = appointment.staff_members?.length ? appointment.staff_members.join(", ") : appointment.staff || "Unassigned";

  return (
    <tr
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`cursor-pointer border-b transition ${
        dark ? "border-white/5 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"
      }`}
    >
      <td className="px-6 py-4">
        <p className={`text-sm font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>{appointment.customer}</p>
        {appointment.phone && <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{appointment.phone}</p>}
      </td>
      <td className={`px-6 py-4 text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>{services}</td>
      <td className={`px-6 py-4 text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>{staff}</td>
      <td className={`px-6 py-4 text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>{appointment.date}</td>
      <td className={`px-6 py-4 text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>
        {appointment.time}
        {appointment.end_time ? <span className={dark ? "text-gray-500" : "text-gray-400"}> – {appointment.end_time}</span> : null}
      </td>
      <td className="px-6 py-4">
        <AppointmentStatus status={appointment.status} />
      </td>
      <td className={`px-6 py-4 text-sm font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>
        {appointment.price} ETB
        {appointment.payment_status === "Paid" && <span className="ml-1.5 text-xs font-medium text-emerald-500">Paid</span>}
        {appointment.payment_status === "Deposit" && <span className="ml-1.5 text-xs font-medium text-amber-500">Deposit</span>}
      </td>
    </tr>
  );
}
