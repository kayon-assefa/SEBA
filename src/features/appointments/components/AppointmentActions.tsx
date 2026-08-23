// src/features/Appointments/components/AppointmentActions.tsx

import type { Appointment, AppointmentStatus } from "../types/appointment";

type Props = {
  appointment: Appointment;
  onStatusChange: (status: AppointmentStatus) => void;
  onMarkPaid: () => void;
  onInvoice: () => void;
  onEdit: () => void;
  onDelete: () => void;
  loading?: boolean;
};

export default function AppointmentActions({ appointment, onStatusChange, onMarkPaid, onInvoice, onEdit, onDelete, loading = false }: Props) {
  const isCompleted = appointment.status === "Completed";
  const isCancelled = appointment.status === "Cancelled";
  const disabled = loading || isCompleted || isCancelled;

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        disabled={disabled || appointment.status === "Confirmed"}
        onClick={() => onStatusChange("Confirmed")}
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Updating..." : "Confirm"}
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onStatusChange("Completed")}
        className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Complete
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onStatusChange("No-show")}
        className="rounded-lg bg-gray-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        No-show
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onStatusChange("Cancelled")}
        className="rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="button"
        disabled={loading || appointment.payment_status === "Paid"}
        onClick={onMarkPaid}
        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {appointment.payment_status === "Paid" ? "Paid" : "Mark Paid"}
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={onInvoice}
        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Invoice
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={onEdit}
        className="rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Edit
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={onDelete}
        className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
