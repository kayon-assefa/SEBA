// src/features/Appointments/components/AppointmentDetails.tsx

import type { Appointment } from "../types/appointment";
import AppointmentStatus from "./AppointmentStatus";

type Props = {
  appointment: Appointment;
  dark: boolean;
};

export default function AppointmentDetails({ appointment, dark }: Props) {
  const services = appointment.services?.length ? appointment.services : appointment.service ? [appointment.service] : [];
  const staff = appointment.staff_members?.length ? appointment.staff_members : appointment.staff ? [appointment.staff] : [];

  return (
    <div className="space-y-6">
      <Detail dark={dark} label="Customer" value={appointment.customer || "Unknown customer"} />
      <Detail dark={dark} label="Phone" value={appointment.phone || "No phone number"} />
      <Detail dark={dark} label="Services" value={services.length ? services.join(", ") : "No service"} />
      <Detail dark={dark} label="Staff" value={staff.length ? staff.join(", ") : "Not assigned"} />

      <div className="grid grid-cols-2 gap-4">
        <Detail dark={dark} label="Date" value={formatDate(appointment.date)} />
        <Detail dark={dark} label="Time" value={`${appointment.time || "-"} – ${appointment.end_time || "-"}`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Detail dark={dark} label="Price" value={`${appointment.price ?? 0} ETB`} />
        <Detail
          dark={dark}
          label="Payment"
          value={
            appointment.payment_status === "Deposit"
              ? `Deposit paid (${appointment.deposit_amount} ETB)`
              : appointment.payment_status
          }
        />
      </div>

      {appointment.recurrence_frequency && appointment.recurrence_frequency !== "none" && (
        <Detail
          dark={dark}
          label="Recurrence"
          value={`${appointment.recurrence_frequency} · ${appointment.recurrence_occurrences} bookings`}
        />
      )}

      <div>
        <p className={`mb-2 text-sm font-medium ${dark ? "text-gray-500" : "text-gray-500"}`}>Status</p>
        <AppointmentStatus status={appointment.status} />
      </div>

      <Detail dark={dark} label="Notes" value={appointment.notes?.trim() ? appointment.notes : "No notes"} />
    </div>
  );
}

function Detail({ label, value, dark }: { label: string; value: string; dark: boolean }) {
  return (
    <div>
      <p className={`mb-1 text-sm font-medium ${dark ? "text-gray-500" : "text-gray-500"}`}>{label}</p>
      <p className={`text-sm font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function formatDate(date: string | null | undefined) {
  if (!date) return "No date";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
